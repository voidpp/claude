from invoke import Collection

from tasks import backend, frontend

ns = Collection()

ns.add_collection(Collection.from_module(backend))
ns.add_collection(Collection.from_module(frontend))
