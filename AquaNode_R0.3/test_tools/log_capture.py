"""Capture newline-delimited node JSON without modifying raw messages."""
import argparse
import base64
import json
import time
from datetime import datetime, timezone
from pathlib import Path


def envelope(raw, run_id, role):
    result = {"host_utc": datetime.now(timezone.utc).isoformat(),
              "host_monotonic_ns": time.monotonic_ns(), "run_id": run_id,
              "role": role, "raw_base64": base64.b64encode(raw).decode("ascii")}
    try:
        payload = json.loads(raw.decode("utf-8"))
        if not isinstance(payload, dict):
            raise ValueError("JSON must be an object")
        result["packet"] = payload
    except (UnicodeDecodeError, ValueError) as exc:
        result["parse_error"] = str(exc)
    return result


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--port", required=True)
    p.add_argument("--baud", type=int, default=115200)
    p.add_argument("--run-id", required=True)
    p.add_argument("--role", choices=["tx", "rx"], required=True)
    p.add_argument("--out", type=Path, required=True)
    args = p.parse_args()
    import serial
    # Exclusive creation prevents an accidental overwrite of evidence.
    with args.out.open("x", encoding="utf-8") as f:
        with serial.Serial(args.port, args.baud, timeout=1) as port:
            pending = bytearray()
            try:
                while True:
                    pending.extend(port.read(max(1, port.in_waiting)))
                    while b"\n" in pending:
                        raw, _, rest = pending.partition(b"\n")
                        pending = bytearray(rest)
                        f.write(json.dumps(envelope(raw + b"\n", args.run_id, args.role),
                                           ensure_ascii=False) + "\n")
                        f.flush()
                    if len(pending) > 65536:
                        raise ValueError("No newline within 64 KiB; check firmware/baud")
            except KeyboardInterrupt:
                pass
            finally:
                if pending:
                    item = envelope(bytes(pending), args.run_id, args.role)
                    item["incomplete_line"] = True
                    f.write(json.dumps(item, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
