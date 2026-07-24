#!/usr/bin/env python3
"""Telegram login via QR code (avoids the login-code delivery issue for
new third-party api_ids; see Telethon issue #4730).

Run:  ./venv/bin/python login.py
Then on your phone: Telegram -> Settings -> Devices -> Link Desktop Device
and scan the QR that appears in this terminal.
"""

import asyncio
import os
from pathlib import Path

import qrcode
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError


def load_env():
    for line in Path(__file__).with_name(".env").read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


load_env()

# mobile device profile: works around silent code/QR failures for new api_ids
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


def show_qr(url: str):
    print("\033c", end="")  # clear terminal
    qr = qrcode.QRCode(border=1)
    qr.add_data(url)
    qr.make(fit=True)
    qr.print_ascii(invert=True)
    print("\nScan with your phone: Telegram -> Settings -> Devices -> Link Desktop Device")
    print("(QR refreshes automatically if it expires)\n")


async def main():
    await client.connect()
    if not await client.is_user_authorized():
        qr_login = await client.qr_login()
        show_qr(qr_login.url)
        while True:
            try:
                await qr_login.wait(timeout=60)
                break
            except asyncio.TimeoutError:
                await qr_login.recreate()
                show_qr(qr_login.url)
            except SessionPasswordNeededError:
                pw = input("Two-factor password: ")
                await client.sign_in(password=pw)
                break

    me = await client.get_me()
    print(f"\nLogged in as: {me.first_name} (@{me.username}) id={me.id}")
    print("Session saved. You will not need to log in again.")
    await client.disconnect()


asyncio.run(main())
