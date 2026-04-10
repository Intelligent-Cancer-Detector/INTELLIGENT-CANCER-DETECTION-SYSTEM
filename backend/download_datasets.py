import kagglehub
import pandas as pd
import os
import shutil

def main():
    # 1. Ensure the 'data' folder exists in your project
    data_dir = 'data'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created directory: {data_dir}")

    # 2. Download the Multi-Cancer Symptom dataset
    # This dataset includes symptoms like Cough, Fatigue, Wheezing, etc.
    print("Connecting to Kaggle to download the dataset...")
    try:
        # Handle for: Cancer Patients and Air Pollution dataset
        path = kagglehub.dataset_download("thedevastator/cancer-patients-and-air-pollution-a-new-link")
        
        # 3. Locate the CSV file in the downloaded cache
        files = [f for f in os.listdir(path) if f.endswith('.csv')]
        if not files:
            print("Error: No CSV file found in the downloaded dataset.")
            return

        source_file = os.path.join(path, files[0])
        destination_file = os.path.join(data_dir, "cancer_data.csv")

        # 4. Copy the file to your project's data folder
        shutil.copy(source_file, destination_file)
        print(f"Successfully saved dataset to: {destination_file}")

        # 5. Preview the data to confirm it's correct
        df = pd.read_csv(destination_file)
        print("\n--- Dataset Preview (First 5 Rows) ---")
        print(df.head())
        
        print("\n--- Symptoms/Features Found ---")
        # These are the symptoms you will use for your 10 cancer logic
        print(df.columns.tolist())

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        print("Make sure you have an internet connection and 'kagglehub' installed.")

if __name__ == "__main__":
    main()