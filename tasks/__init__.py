from invoke import Collection

from tasks import backend, frontend
from tasks.backend import redis

ns = Collection()

backend_collection = Collection.from_module(backend)
backend_collection.add_collection(redis)
ns.add_collection(backend_collection)

ns.add_collection(Collection.from_module(frontend))
