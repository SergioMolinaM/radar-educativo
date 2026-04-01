from services.metadata_service import MetadataService
import pandas as pd
import os

service = MetadataService()
dataset_id = "mineduc_directorio"

print(f"Dataset ID: {dataset_id}")
print(f"Metadata: {service.get_dataset_metadata(dataset_id)}")
print(f"Mapping exists: {'Sí' if service.get_mappings(dataset_id) else 'No'}")
print(f"Staging Target: {service.get_staging_target(dataset_id)}")
print(f"Analytics Target: {service.get_analytics_target(dataset_id)}")
