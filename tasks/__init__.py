from invoke import Collection

from tasks import backend, frontend, top
from tasks.backend import redis

ns = Collection.from_module(top)

backend_collection = Collection.from_module(backend)
backend_collection.add_collection(redis)
ns.add_collection(backend_collection)

ns.add_collection(Collection.from_module(frontend))
