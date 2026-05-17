from pathlib import Path
import os


PROJECT_DIR = Path(__file__).resolve().parent
REPO_ROOT = PROJECT_DIR.parent

RAW_DATA_DIR = PROJECT_DIR / "raw_data"
PROCESSED_DATA_DIR = PROJECT_DIR / "processed_data"
OUTPUTS_DIR = PROJECT_DIR / "outputs"

METADATA_WITH_SPLIT_CSV = PROCESSED_DATA_DIR / "metadata_with_split.csv"
METADATA_BINARY_CSV = PROCESSED_DATA_DIR / "metadata_binary.csv"
SLICE_METADATA_CSV = PROCESSED_DATA_DIR / "slice_metadata.csv"
SLICE_METADATA_CENTRAL_CSV = PROCESSED_DATA_DIR / "slice_metadata_central.csv"
SLICE_METADATA_BINARY_CSV = PROCESSED_DATA_DIR / "slice_metadata_binary.csv"
BINARY_TEST_NODULE_PREDICTIONS_CSV = (
    PROCESSED_DATA_DIR / "binary_test_nodule_predictions.csv"
)

BEST_DENSENET121_PATH = PROJECT_DIR / "best_densenet121.pth"
BEST_DENSENET121_BINARY_PATH = PROJECT_DIR / "best_densenet121_binary.pth"
BEST_DENSENET121_CENTRAL_PATH = PROJECT_DIR / "best_densenet121_central.pth"
BEST_DENSENET121_IMPROVED_PATH = PROJECT_DIR / "best_densenet121_improved.pth"


def env_or_path(env_name: str, default: Path) -> Path:
    value = os.getenv(env_name)
    return Path(value).expanduser() if value else default
