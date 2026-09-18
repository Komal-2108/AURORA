import sys
from pathlib import Path

# Path to backend directory and root AURORA directory
TESTS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = TESTS_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

for p in [ROOT_DIR, BACKEND_DIR]:
    s = str(p)
    if s not in sys.path:
        sys.path.insert(0, s)
