import importlib.util
import tempfile
import unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location('catalog', Path(__file__).parents[2] / 'scripts/build_catalog.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
class ContentLinks(unittest.TestCase):
    def test_dependency_docs_are_ignored_and_authored_errors_are_kept(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            for name in ('wiki/chapter.md','node_modules/package/README.md','docs/superpowers/plan.md'):
                p=root/name; p.parent.mkdir(parents=True, exist_ok=True); p.write_text('[Broken](missing.md)')
            before=module.ROOT
            module.ROOT=root
            try:
                errors=module.check_links()
                self.assertEqual(len(errors),1)
                self.assertIn('wiki/chapter.md',errors[0])
            finally: module.ROOT=before

