import typer
from rich.console import Console
from services.pipeline_service import PipelineService

app = typer.Typer(help="Radar Data Platform - Pipeline CLI")
console = Console()
pipeline = PipelineService()


@app.command()
def catalog():
    """Descubre nuevos datasets y actualiza el catálogo maestro."""
    try:
        pipeline.run_catalog()
        console.print("[bold green]Catalogación completada.[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Fallo en catalogación:[/bold red] {e}")
        raise typer.Exit(code=1)


@app.command()
def download():
    """Descarga datasets aprobados con nombres estandarizados."""
    try:
        pipeline.run_download()
        console.print("[bold green]Descarga completada.[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Fallo en descarga:[/bold red] {e}")
        raise typer.Exit(code=1)


@app.command()
def profile(
    dataset_id: str = typer.Argument(
        ..., help="ID del dataset (ej: mineduc_directorio)"
    )
):
    """Genera perfilado estructural del dataset."""
    try:
        pipeline.run_profile(dataset_id)
        console.print(f"[bold green]Perfilado de {dataset_id} completado.[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Fallo en perfilado:[/bold red] {e}")
        raise typer.Exit(code=1)


@app.command()
def validate(dataset_id: str):
    """Ejecuta reglas de validación de calidad sobre el dataset."""
    try:
        pipeline.run_validate(dataset_id)
        console.print(f"[bold green]Validación de {dataset_id} completada.[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Fallo en validación de {dataset_id}:[/bold red] {e}")
        raise typer.Exit(code=1)


@app.command()
def load(dataset_id: str):
    """Orquesta la carga multi-etapa (Raw -> Staging -> Analytics)."""
    try:
        pipeline.run_load(dataset_id)
        console.print(f"[bold green]Carga de {dataset_id} completada.[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Fallo en la carga de {dataset_id}:[/bold red] {e}")
        raise typer.Exit(code=1)


@app.command()
def document(dataset_id: str):
    """Genera la ficha técnica versionada del dataset."""
    try:
        pipeline.run_document(dataset_id)
        console.print(f"[bold green]Documentación de {dataset_id} generada.[/bold green]")
    except Exception as e:
        console.print(f"[bold red]Fallo en documentación de {dataset_id}:[/bold red] {e}")
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
