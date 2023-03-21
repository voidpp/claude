# Claude

## Requirements

- python 3.10+
- nodejs (for developement only)
- Redis (to store dashboard settings so [persistence](https://redis.io/docs/management/persistence/) is highly recommended)

## Install for developement

```bash
# create virtualenv and activate, install poetry
poetry install
```

### Example config

- Create a file with this content

```yml
redis: redis://where.your.redis.lives.com/1
plugins_folder: /home/user/devel/claude/_tmp_plugins
```

- Save to eg `/home/user/devel/claude/config.yaml`
- create the `plugins_folder`
- Set the filename to the `CLAUDE_CONFIG_FILE` env var

```bash
export CLAUDE_CONFIG_FILE=/home/user/devel/claude/config.yaml
```

## List all helper commands

```bash
invoke --list
```

## For install in production see the wiki:

https://github.com/voidpp/claude/wiki

## For plugins see:

https://github.com/voidpp/claude-plugins

## Example dashboard

![image](https://user-images.githubusercontent.com/6121328/226597258-bc605161-f13a-4947-921b-cf7eaae39ba5.png)
