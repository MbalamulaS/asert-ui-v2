#!/bin/bash

# Function to print in green
print_green() {
  tput setaf 2
  echo "***** $1 *****"
  tput sgr0
}

# Function to print in red
print_red() {
  tput setaf 1
  tput blink
  echo "***** $1 *****"
  tput sgr0
}

# Function to print in red
print_yellow() {
  tput setaf 3
  echo "***** $1 *****"
  tput sgr0
}

# # Rebuild Angular files
# print_yellow "Starting Angular server..."
# #!/bin/bash

# SCREEN_SESSION_ID=635140
# NG_SERVE_COMMAND="ng serve"

# # Attach to the screen session and send Ctrl-C to the ng serve process
# screen -S "$SCREEN_SESSION_ID" -X stuff $'\003' > /dev/null 2>&1

# # Wait for a moment to ensure ng serve stops gracefully
# sleep 5

# # Restart ng serve
# screen -S "$SCREEN_SESSION_ID" -X stuff "$NG_SERVE_COMMAND"$'\n' > /dev/null 2>&1
# if [ $? -eq 0 ]; then
#   print_green "Angular server started successfully."
# else
#   print_red "Failed to start Angular server."
#   exit 1
# fi

# Rebuild the Angular app
print_yellow "Rebuilding Angular app..."
yarn build
if [ $? -eq 0 ]; then
  print_green "Angular app built successfully."
else
  print_red "Failed to build the Angular app. Check the errors shown above!"
  exit 1
fi

# Remove existing NGiNX files
print_yellow "Removing existing NGiNX files from /var/www/html/zanhfrtesting/..."
rm -rf /var/www/html/zanhfrtesting/*
if [ $? -eq 0 ]; then
  print_green "Existing NGiNX files removed successfully."
else
  print_red "Failed to remove existing NGiNX files. Check the errors shown above!"
  exit 1
fi

# Copy the newly built files
print_yellow "Copying newly built files to /var/www/html/zanhfrtesting/..."
cp -r dist/browser/* /var/www/html/zanhfrtesting
if [ $? -eq 0 ]; then
  print_green "Newly built files copied successfully."
else
  print_red "Failed to copy newly built files. Check the errors shown above!"
  exit 1
fi

print_green "Deployment completed successfully."
