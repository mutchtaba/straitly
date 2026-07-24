#!/usr/bin/env python3
"""Straitly Telegram CLI — outreach + DM management as @Xynth1.

Usage:
  tg.py whoami                     verify session
  tg.py unread                     list chats with unread messages
  tg.py channels [chats] [msgs]    last msgs from most recent active channels (default 10x10)
  tg.py history <user> [n]         show last n messages with a user (default 15)
  tg.py send <user> "<message>"    send a DM (asks for confirmation)
  tg.py send <user> "<message>" --yes    send without confirmation prompt

<user> can be an @username, phone (+1...), or numeric id.
"""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

from telethon import TelegramClient


def load_env():
    for line in Path(__file__).with_name(".env").read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


load_env()

client = TelegramClient(
    str(Path(__file__).with_name("user1")),
    int(os.environ["TG_API_ID"]),
    os.environ["TG_API_HASH"],
    device_model="Pixel 5",
    system_version="11",
    app_version="8.4.1",
    lang_code="en",
    system_lang_code="en-US",
)


def fmt_time(dt):
    return dt.astimezone().strftime("%b %d %H:%M")


async def whoami():
    me = await client.get_me()
    print(f"@{me.username} ({me.first_name}) id={me.id}")


async def unread():
    found = False
    async for d in client.iter_dialogs():
        if d.unread_count > 0 and d.is_user:
            found = True
            name = f"@{d.entity.username}" if d.entity.username else d.name
            print(f"{name:30} unread={d.unread_count:3}  last={fmt_time(d.date)}")
    if not found:
        print("No unread DMs.")


async def channels(n_chats: int = 10, n_msgs: int = 10):
    """Print last n_msgs from the n_chats most recently active channels/groups."""
    targets = []
    async for d in client.iter_dialogs():
        if d.is_channel or d.is_group:
            targets.append(d)
        if len(targets) >= n_chats:
            break
    if not targets:
        print("No channels or groups found.")
        return
    for d in targets:
        kind = "channel" if d.is_channel and not d.is_group else "group"
        print(f"\n{'=' * 70}\n{d.name}  [{kind}]  last activity {fmt_time(d.date)}\n{'=' * 70}")
        msgs = await client.get_messages(d.entity, limit=n_msgs)
        for m in reversed(msgs):
            sender = ""
            if m.sender:
                sender = (
                    f"@{m.sender.username}" if getattr(m.sender, "username", None)
                    else getattr(m.sender, "first_name", None) or getattr(m.sender, "title", "?")
                )
            text = (m.text or f"[{m.media.__class__.__name__ if m.media else 'service message'}]")
            text = text.replace("\n", " ")
            if len(text) > 160:
                text = text[:157] + "..."
            print(f"[{fmt_time(m.date)}] {sender}: {text}")


async def history(target: str, n: int):
    entity = await client.get_entity(target)
    me = await client.get_me()
    msgs = await client.get_messages(entity, limit=n)
    for m in reversed(msgs):
        who = "me" if m.sender_id == me.id else target
        text = (m.text or f"[{m.media.__class__.__name__}]").replace("\n", " ")
        print(f"[{fmt_time(m.date)}] {who}: {text}")


async def send(target: str, message: str, skip_confirm: bool):
    entity = await client.get_entity(target)
    display = f"@{entity.username}" if getattr(entity, "username", None) else target
    if not skip_confirm:
        print(f"To:      {display}")
        print(f"Message: {message}")
        if input("Send? [y/N] ").strip().lower() != "y":
            print("Cancelled.")
            return
    await client.send_message(entity, message)
    print(f"Sent to {display} at {datetime.now().strftime('%H:%M:%S')}")


async def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return
    cmd = args[0]
    await client.connect()
    if not await client.is_user_authorized():
        print("Session expired — rerun login.py")
        return
    try:
        if cmd == "whoami":
            await whoami()
        elif cmd == "unread":
            await unread()
        elif cmd == "channels":
            n_chats = int(args[1]) if len(args) > 1 else 10
            n_msgs = int(args[2]) if len(args) > 2 else 10
            await channels(n_chats, n_msgs)
        elif cmd == "history":
            await history(args[1], int(args[2]) if len(args) > 2 else 15)
        elif cmd == "send":
            skip = "--yes" in args
            rest = [a for a in args[1:] if a != "--yes"]
            await send(rest[0], rest[1], skip)
        else:
            print(__doc__)
    finally:
        await client.disconnect()


asyncio.run(main())
