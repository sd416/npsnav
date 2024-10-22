import os
import json
from datetime import datetime

def create_folder_and_json(file_path, output_folder):
    # Read the input JSON file
    with open(file_path, 'r') as f:
        data = json.load(f)

    # Get the folder name from the file name (without extension)
    folder_name = os.path.splitext(os.path.basename(file_path))[0]

    # Create the full path for the subfolder inside the output folder
    folder_path = os.path.join(output_folder, folder_name)

    # Create the folder if it doesn't exist
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    # Process each date in the JSON file
    for date, value in data.items():
        # Generate the JSON file name based on the date
        date_obj = datetime.strptime(date, "%m/%d/%Y")
        json_file_name = date_obj.strftime("%m%d%Y") + ".json"
        json_file_path = os.path.join(folder_path, json_file_name)

        # If the JSON file exists, load and compare the value
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r') as jf:
                existing_data = json.load(jf)

            # If the value is the same, skip updating
            if existing_data.get(date) == value:
                print(f"Skipping {json_file_name}, value unchanged.")
                continue

        # Write the new or updated data to the JSON file
        with open(json_file_path, 'w') as jf:
            json.dump({date: value}, jf, indent=4)
        print(f"Created/Updated {json_file_name} in {folder_path}.")

def process_folder(input_folder, output_folder):
    # List of files to exclude
    exclude_files = {'data.json', 'nifty.json'}

    # Iterate over all JSON files in the input folder
    for file_name in os.listdir(input_folder):
        if file_name.endswith('.json') and file_name not in exclude_files:
            file_path = os.path.join(input_folder, file_name)
            create_folder_and_json(file_path, output_folder)

# Usage example:
input_folder = "./data/"  # Replace with the path to your folder containing input JSON files
output_folder = "./public/api/date/"  # Replace with the desired output folder path

# Create the output folder if it doesn't exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

process_folder(input_folder, output_folder)

