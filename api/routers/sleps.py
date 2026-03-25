"""SLEPs router - List available SLEPs and their configuration."""
import yaml
from fastapi import APIRouter

router = APIRouter()


def _load_sleps() -> list:
    """Load SLEP config from YAML."""
    for path in ["api/config/slep_config.yaml", "config/slep_config.yaml"]:
        try:
            with open(path) as f:
                config = yaml.safe_load(f)
            return config.get("sleps", [])
        except FileNotFoundError:
            continue
    return []


@router.get("/")
def list_sleps():
    """List all configured SLEPs."""
    sleps = _load_sleps()
    return {
        "total": len(sleps),
        "sleps": [
            {
                "id": s["id"],
                "name": s["name"],
                "region": s.get("region", ""),
                "codigo_organismo": s.get("codigo_organismo", ""),
                "has_rut": s.get("rut", "PENDIENTE") != "PENDIENTE",
            }
            for s in sleps
        ],
    }
