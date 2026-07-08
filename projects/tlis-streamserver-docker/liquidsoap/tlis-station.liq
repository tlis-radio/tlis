#!/usr/bin/liquidsoap

# music and jingles root folder
audio_root = "/music"
schedule_file = "scheduled.json"

# icecast server parameters for final audio output
icecast_hostname = "icecast"
icecast_port = 8000
icecast_mountpoint = "tlis.mp3"
icecast_source_password = "devSourcePassword" # TODO fix getenv
output_bitrate_kbps = 256

# parameters for receiving stream from studio
harbor_mountpoint_name = "studio.mp3"
harbor_port = 8100
harbor_source_password = getenv("HARBOR_SOURCE_PASSWORD", "")

# parameters for dumping stream to files
replay_bitrate_kbps = 256
replay_root = "/replay"
replay_keep_days = "2"

# end of configuration options --------------------------------

time.zone.set("Europe/Bratislava")

# playlist definitions
jingles = playlist(mode = "random",reload = 300, reload_mode = "seconds", "#{audio_root}/jingles/")

play0006 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "#{audio_root}/00h-06h")
play0612 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "#{audio_root}/06h-12h")
play1218 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "#{audio_root}/12h-18h")
play1824 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "#{audio_root}/18h-24h")

schedule_queue = request.queue(id="schedule_queue")

def queue_scheduled_audio()
    try
        current_date_time = time.string("%Y-%m-%dT%H:%M")
        print("Current hour is #{current_date_time}")

        file_content = file.contents("#{audio_root}/planovane_relacie/#{schedule_file}")

        if file_content == "" or file_content == "[]" then
            print("Nič neni naplanovane.")
        else
            let json.parse (shows : [{"date_times" as date_times: [string], "audio" as audio: string}]) = file_content

            list.iter(
                fun(show) ->
                    list.iter(
                        fun(date_time)->
                            if date_time == current_date_time then
                                request_path = "#{audio_root}/planovane_relacie/#{show.audio}"
                                req = request.create(request_path)
                                schedule_queue.push(req)
                                print("Queued scheduled audio: #{request_path}")
                            end
                    ,
                    show.date_times
                    )
                , 
                shows
            )
        end

    catch err do
        print("Scheduler error: #{err.kind}: #{err.message}")
    end
end

thread.run(every=60., queue_scheduled_audio)

# select tracks from playlists based on time of day
fallback_music = switch([
    ({ 0h-6h }, play0006),
    ({ 6h-12h }, play0612),
    ({ 12h-18h }, play1218),
    ({ 18h-0h }, play1824)
])

# add jingles
fallback_rotation = rotate(weights=[1,3],[jingles, fallback_music])

# add scheduled audio to fallback rotation
fallback_rotation = fallback(
    track_sensitive=true,
    [
        schedule_queue,
        fallback_rotation
    ]
)

# force the fallback rotation to start at the beginning of a song when disconnecting the studio stream
def on_studio_disconnect() =
    # fallback_music.skip()
    fallback_rotation.skip()
end

# get live stream from studio
# studio = input.harbor(harbor_mountpoint_name, port=harbor_port, password=harbor_source_password, on_disconnect=on_studio_disconnect)
# CAUTION - due to the reduced buffer length (default is 12 seconds), DO NOT use the crossfade() function on this source!
studio = input.harbor(harbor_mountpoint_name, port=harbor_port, password=harbor_source_password, buffer=6.0)

def to_studio(_, b)
    b
end

# insert short silence after studio stream before switching back to fallback_rotation
def to_fallback(_, b)
    fallback_rotation.skip()
    # sequence([blank(duration=1.0), fade.in(duration=3.0, type="sin", b.source)])
    (sequence([
        # (fade.out(duration=1.0, type="sin", a):source), 
        (blank(duration=3.0):source),
        b
    ]):source)
end

main_stream = fallback(track_sensitive=false, transition_length=5.0, transitions=[to_studio, to_fallback], [studio, fallback_rotation])

# generate sinewave + noise as backup sound when no fallback playlists are available
offline_sound = add(normalize=false, weights=[0.5, 0.05], [sine(440.0), noise()])

# use studio when available, use fallback when studio goes offline
output_stream = fallback(track_sensitive=false, [main_stream, offline_sound])

# stream silence if all audio sources fail
# output_stream = mksafe(output_stream)

# keep a copy of the output stream without final compression and normalization
output_stream_uncompressed = output_stream

# compress and normalize
output_stream = nrj(output_stream)

# stream to icecast server
output.icecast(
    %mp3(bitrate=output_bitrate_kbps), 
    host=icecast_hostname,
    port=icecast_port,
    password=icecast_source_password,
    mount=icecast_mountpoint, 
    output_stream
)

# send unprocessed output stream to icecast server
output.icecast(
    %mp3(bitrate=output_bitrate_kbps),
    host=icecast_hostname,
    port=icecast_port,
    password=icecast_source_password,
    mount="tlis_unprocessed.mp3",
    output_stream_uncompressed
)

# stream also to the studio mountpoint in order to display metadata (portal radia.sk is bound to /studio.mp3, after they change it to tlis.mp3 this can be removed)
output.icecast(
    %mp3(bitrate=64),
    host=icecast_hostname,
    port=icecast_port,
    password=icecast_source_password,
    mount="studio.mp3",
    output_stream
)

# save stream to file (generate replay files)
output.file(%mp3(bitrate=replay_bitrate_kbps),
    "#{replay_root}/tlis-replay-%Y-%m-%dT%H-%M-%S.mp3",
    output_stream,
    reopen_when={0m}
)

output.file(%mp3(bitrate=replay_bitrate_kbps),
    "#{replay_root}/tlis-replay-raw-%Y-%m-%dT%H-%M-%S.mp3",
    output_stream_uncompressed,
    reopen_when={0m}
)


# periodically clean old recordings
#thread.when(every=3600.0, { true },
#    fun () -> list.iter(fun(msg) -> log(msg, label="archive_cleaner"),
        # list.append(
            # process.read.lines("find #{replay_root}/* -type f -mtime +#{replay_keep_days} -delete"),
#            process.read.lines("find #{replay_root}/* -type f -mtime +#{replay_keep_days} -delete")
        # )
#    )
#)