import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

TEMPLATE_TS = """// Auto-generated {file_type} for {model_cap}
export class {class_name} {{
  // TODO: Implement {file_type}
}}
"""

TEMPLATE_TEST = """// Auto-generated test for {model_cap} {file_type}
describe('{class_name}', () => {{
  it('should be defined', () => {{
    expect(true).toBe(true);
  }});
}});
"""

FILES = [
    ("preParser.ts", "PreParser"),
    ("packageParser.ts", "PackageParser"),
    ("commandBuilder.ts", "CommandBuilder"),
]


def create_file(path: Path, content: str = ""):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(content, encoding="utf-8")
        print(f"[✓] Created: {path}")
    else:
        print(f"[i] Exists: {path}")


def create_project(model: str):
    model = model.lower()
    model_cap = model.upper()
    class_prefix = model_cap

    src_dir = BASE_DIR / "src"
    test_dir = BASE_DIR / "tests"
    index_ts = src_dir / "index.ts"

    for filename, class_suffix in FILES:
        # src/
        ts_path = src_dir / filename
        class_name = f"{class_prefix}{class_suffix}"
        ts_content = TEMPLATE_TS.format(
            model_cap=model_cap, class_name=class_name, file_type=class_suffix
        )
        create_file(ts_path, ts_content)

        # tests/
        test_filename = filename.replace(".ts", ".test.ts")
        test_path = test_dir / test_filename
        test_content = TEMPLATE_TEST.format(
            model_cap=model_cap, class_name=class_name, file_type=class_suffix
        )
        create_file(test_path, test_content)

    # index.ts
    create_file(index_ts, "// Entry point\n")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python create_project.py <nome_do_modelo>")
        sys.exit(1)

    model_name = sys.argv[1]
    create_project(model_name)
