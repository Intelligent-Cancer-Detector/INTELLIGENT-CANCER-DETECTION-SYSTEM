import kagglehub

# Download latest version
path = kagglehub.dataset_download("thedevastator/cancer-patients-and-air-pollution-a-new-link")

print("Path to dataset files:", path)