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
  echo "***** $1 *****"
  tput sgr0
}

# Function to print in red
print_yellow() {
  tput setaf 3
  echo "***** $1 *****"
  tput sgr0
}

# Checkout develop branch
print_yellow "Checking out develop branch..."
git checkout develop --quiet
if [ $? -eq 0 ]; then
  print_green "Checkout successful."
else
  print_red "Checkout failed. Please check the errors above."
  exit 1
fi

# Fetch changes from develop branch
print_yellow "Fetching from develop branch..."
git fetch
if [ $? -eq 0 ]; then
  print_green "Fetching successful."
else
  print_red "Fetching failed. Please check the errors above."
  exit 1
fi

# Merge with origin changes
print_yellow "Merging with oridin develop branch..."
git merge origin/develop -m "CI/CD Automerge"
if [ $? -eq 0 ]; then
  print_green "Merging successful."
else
  print_red "Merging failed. Please check the errors above."
  exit 1
fi

# Fetch changes from develop branch
print_yellow "Installing dependencies..."
yarn install -s
if [ $? -eq 0 ]; then
  print_green "yarn install successful."
else
  print_red "yarn update failed. Please check the errors above."
  exit 1
fi

# Run the build script
print_yellow "Opening build script..."
bash ./builder.sh
