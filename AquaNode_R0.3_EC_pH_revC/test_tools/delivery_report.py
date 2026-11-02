"""Calculate end-to-end delivery from TX_DONE and RX_OK logs, never max(seq)."""
import argparse
import json
from pathlib import Path


def key(packet):
    for name in ("node_id", "boot_id"):
        if not isinstance(packet.get(name), str) or not packet[name]:
            raise ValueError("nonempty node_id and boot_id required")
    if type(packet.get("seq")) is not int or packet["seq"] < 0:
        raise ValueError("seq must be a nonnegative integer")
    return packet["node_id"], packet["boot_id"], packet["seq"]


def read_events(path, role, event, run_id):
    identities = []
    rejected = 0
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        item = json.loads(line)
        if item.get("run_id") != run_id or item.get("role") != role:
            continue
        packet = item.get("packet", {})
        if item.get("incomplete_line") or "parse_error" in item:
            rejected += 1
            continue
        if packet.get("event") != event:
            continue
        try:
            identities.append(key(packet))
        except ValueError:
            rejected += 1
    return identities, rejected


def report(tx, rx, run_id):
    sent, bad_tx = read_events(tx, "tx", "TX_DONE", run_id)
    received, bad_rx = read_events(rx, "rx", "RX_OK", run_id)
    s, r = set(sent), set(received)
    return {"run_id": run_id, "unique_sent": len(s),
            "unique_received_matching_tx": len(s & r),
            "delivery_percent": 100 * len(s & r) / len(s) if s else None,
            "tx_events": len(sent), "rx_events": len(received),
            "tx_repeat_events": len(sent) - len(s),
            "rx_duplicate_events": len(received) - len(r),
            "missing_packet_ids": sorted(s - r),
            "rx_ids_absent_from_tx": sorted(r - s),
            "invalid_tx_records": bad_tx, "invalid_rx_records": bad_rx,
            "note": "Valid only with complete independent TX/RX logs for the same test window."
            }


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--tx", required=True)
    p.add_argument("--rx", required=True)
    p.add_argument("--run-id", required=True)
    a = p.parse_args()
    print(json.dumps(report(a.tx, a.rx, a.run_id), ensure_ascii=False, indent=2))
