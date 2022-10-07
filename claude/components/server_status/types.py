from pydantic import BaseModel


class CPUData(BaseModel):
    cores: int


class HDDData(BaseModel):
    device: str
    free: int
    label: str
    mount: str
    percent: float
    total: int
    used: int


class MemoryData(BaseModel):
    available: int
    free: int
    percent: float
    total: int
    used: int


class ServerStatusData(BaseModel):
    cpu: CPUData
    hdd: list[HDDData]
    load: list[float]
    memory: MemoryData
    uptime: int


class ServerStatusResponse(BaseModel):
    ping: float = None
    status: ServerStatusData = None
