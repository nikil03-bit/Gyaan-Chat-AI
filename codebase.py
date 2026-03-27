import os

# Configuration: What to include and what to ignore
OUTPUT_FILE = "project_codebase.md"
IGNORE_DIRS = {'.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build', 'chroma', 'uploads'}
IGNORE_FILES = {'.env', 'package-lock.json', 'project_codebase.md', '.DS_Store'}
ALLOWED_EXTENSIONS = {'.py', '.ts', '.tsx', '.json', '.yml', '.yaml', '.html', '.css'}

def generate_codebase(root_dir):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Project Codebase Snapshot\n\n")
        
        # 1. Generate Directory Tree
        f.write("## Directory Structure\n```text\n")
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            level = root.replace(root_dir, '').count(os.sep)
            indent = ' ' * 4 * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            sub_indent = ' ' * 4 * (level + 1)
            for file in files:
                if file not in IGNORE_FILES:
                    f.write(f"{sub_indent}{file}\n")
        f.write("```\n\n---\n\n")

        # 2. Append File Contents
        f.write("## File Contents\n\n")
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for file in files:
                if file in IGNORE_FILES:
                    continue
                
                file_ext = os.path.splitext(file)[1]
                if file_ext in ALLOWED_EXTENSIONS or file == "Dockerfile" or file == "docker-compose.yml":
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_dir)
                    
                    f.write(f"### File: {relative_path}\n")
                    f.write(f"```{file_ext.replace('.', '') if file_ext else 'text'}\n")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as content_file:
                            f.write(content_file.read())
                    except Exception as e:
                        f.write(f"Error reading file: {e}")
                    f.write("\n```\n\n")

    print(f"Success! Codebase saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_codebase(os.getcwd())