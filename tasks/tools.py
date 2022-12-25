import invoke


class Collection(invoke.Collection):
    def task(self, *args, **kwargs):
        def decor(func):
            self.add_task(invoke.Task(func, *args, **kwargs))
            return func

        return decor
