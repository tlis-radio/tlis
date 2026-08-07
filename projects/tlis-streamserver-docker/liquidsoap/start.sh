#!/bin/sh

echo Hellooo

# Define the directories and root path
DIRECTORY_ROOT="/music"
DIRECTORIES='jingles planovane_relacie'
SCHEDULED_FILE="${DIRECTORY_ROOT}/planovane_relacie/scheduled.json"

# Create directories if they don't exist and set permissions
echo "00h-06h" > /tmp/dirs.txt
echo "06h-12h" >> /tmp/dirs.txt
echo "12h-18h" >> /tmp/dirs.txt
echo "18h-24h" >> /tmp/dirs.txt
echo "jingles" >> /tmp/dirs.txt
echo "planovane_relacie" >> /tmp/dirs.txt
 
while read directory; do
  d="${DIRECTORY_ROOT}/${directory}"
  
  if [ ! -d "$d" ]; then
    mkdir "$d"
    chown -R walkman:walkman "$d"
    chmod -R 2777 "$d"
  fi
done < /tmp/dirs.txt
 
rm /tmp/dirs.txt

# check if sheduled.json file exists and if not, copy template file to its location
if [ ! -f "${SCHEDULED_FILE}" ]; then
    cp "/scheduled_template.json" "${SCHEDULED_FILE}"
    chown 911:walkman "${SCHEDULED_FILE}" # 911 is the filebrowser UID, this is a dirty fix but hopefully it will hold in the future
    chmod 660 "${SCHEDULED_FILE}"
fi

# run liquidsoap as user walkman
su -c 'liquidsoap /tlis-station.liq' walkman