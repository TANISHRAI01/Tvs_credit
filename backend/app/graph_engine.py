"""
TVS Sentinel — Graph Engine
Builds the Digital Twin: a NetworkX graph connecting all lending entities.

Nodes: Customers, Devices, Dealers, Bank Accounts, Mobiles, Locations, Guarantors, Loan Applications
Edges: Relationships between entities (customer→device, customer→guarantor, etc.)
"""

import json
import networkx as nx
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path(__file__).parent.parent / "data" / "generated"


class SentinelGraph:
    """
    The Digital Twin of the lending ecosystem.
    A heterogeneous graph where nodes are entities and edges are relationships.
    """

    def __init__(self):
        self.graph: nx.Graph = nx.Graph()
        self._applications: list[dict] = []
        self._customers: list[dict] = []
        self._dealers: list[dict] = []
        self._guarantors: list[dict] = []
        self._devices: list[dict] = []

    def load_data(self):
        """Load synthetic data from JSON files."""
        self._applications = self._load_json("applications.json")
        self._customers = self._load_json("customers.json")
        self._dealers = self._load_json("dealers.json")
        self._guarantors = self._load_json("guarantors.json")
        self._devices = self._load_json("devices.json")
        print(f"[GraphEngine] Loaded: {len(self._applications)} applications, "
              f"{len(self._customers)} customers, {len(self._dealers)} dealers")

    def build_graph(self):
        """Construct the full entity graph from loaded data."""
        print("[GraphEngine] Building Digital Twin graph...")

        # Track unique entities to avoid duplicate nodes
        seen_phones = set()
        seen_locations = set()
        seen_bank_accounts = set()
        seen_devices = set()

        for app in self._applications:
            app_id = app["id"]
            cust_id = app["customer_id"]
            dealer_id = app["dealer_id"]
            guarantor_id = app["guarantor_id"]
            device_fp = app["device_fingerprint"]
            phone = app["phone"]
            location = app["location"]
            bank_account = app["bank_account"]

            # ── Add Nodes ──

            # Loan Application node
            self.graph.add_node(app_id, **{
                "type": "loan_application",
                "label": app_id,
                "loan_type": app.get("loan_type", ""),
                "loan_amount": app.get("loan_amount", 0),
                "status": app.get("status", ""),
                "payment_status": app.get("payment_status", ""),
                "submitted_at": app.get("submitted_at", ""),
                "risk_score": 0,  # will be computed later
            })

            # Customer node
            if not self.graph.has_node(cust_id):
                cust_data = self._find_customer(cust_id)
                self.graph.add_node(cust_id, **{
                    "type": "customer",
                    "label": cust_data.get("name", cust_id) if cust_data else cust_id,
                    "city": cust_data.get("city", "") if cust_data else "",
                    "state": cust_data.get("state", "") if cust_data else "",
                    "risk_score": 0,
                })

            # Device node
            dev_node_id = f"DEV_{device_fp[:12]}"
            if dev_node_id not in seen_devices:
                seen_devices.add(dev_node_id)
                self.graph.add_node(dev_node_id, **{
                    "type": "device",
                    "label": f"Device ...{device_fp[:8]}",
                    "fingerprint": device_fp,
                    "risk_score": 0,
                })

            # Dealer node
            if not self.graph.has_node(dealer_id):
                dealer_data = self._find_dealer(dealer_id)
                self.graph.add_node(dealer_id, **{
                    "type": "dealer",
                    "label": dealer_data.get("name", dealer_id) if dealer_data else dealer_id,
                    "city": dealer_data.get("city", "") if dealer_data else "",
                    "risk_score": 0,
                })

            # Guarantor node
            if not self.graph.has_node(guarantor_id):
                guar_data = self._find_guarantor(guarantor_id)
                self.graph.add_node(guarantor_id, **{
                    "type": "guarantor",
                    "label": guar_data.get("name", guarantor_id) if guar_data else guarantor_id,
                    "risk_score": 0,
                })

            # Mobile node
            mob_node_id = f"MOB_{phone}"
            if mob_node_id not in seen_phones:
                seen_phones.add(mob_node_id)
                self.graph.add_node(mob_node_id, **{
                    "type": "mobile",
                    "label": f"Mobile {phone[:5]}...{phone[-4:]}",
                    "phone": phone,
                    "risk_score": 0,
                })

            # Location node
            loc_node_id = f"LOC_{location.replace(' ', '_').replace(',', '')}"
            if loc_node_id not in seen_locations:
                seen_locations.add(loc_node_id)
                self.graph.add_node(loc_node_id, **{
                    "type": "location",
                    "label": location,
                    "lat": app.get("lat", 0),
                    "lng": app.get("lng", 0),
                    "risk_score": 0,
                })

            # Bank Account node
            bank_node_id = f"BANK_{bank_account.replace('-', '_')}"
            if bank_node_id not in seen_bank_accounts:
                seen_bank_accounts.add(bank_node_id)
                self.graph.add_node(bank_node_id, **{
                    "type": "bank_account",
                    "label": bank_account,
                    "risk_score": 0,
                })

            # ── Add Edges (Relationships) ──

            # Customer → applied for → Loan Application
            self.graph.add_edge(cust_id, app_id, relationship="applied_for", weight=1.0)

            # Customer → uses → Device
            self.graph.add_edge(cust_id, dev_node_id, relationship="uses_device", weight=1.0)

            # Customer → owns → Mobile
            self.graph.add_edge(cust_id, mob_node_id, relationship="owns_mobile", weight=1.0)

            # Customer → applied through → Dealer
            self.graph.add_edge(cust_id, dealer_id, relationship="applied_through", weight=1.0)

            # Customer → uses → Bank Account
            self.graph.add_edge(cust_id, bank_node_id, relationship="uses_bank_account", weight=1.0)

            # Customer → located at → Location
            self.graph.add_edge(cust_id, loc_node_id, relationship="located_at", weight=1.0)

            # Customer → connected to → Guarantor
            self.graph.add_edge(cust_id, guarantor_id, relationship="guaranteed_by", weight=1.0)

            # Application → through → Dealer (direct link)
            self.graph.add_edge(app_id, dealer_id, relationship="processed_by", weight=0.8)

        print(f"[GraphEngine] Graph built: {self.graph.number_of_nodes()} nodes, "
              f"{self.graph.number_of_edges()} edges")
        
        self._print_node_type_summary()

    def _print_node_type_summary(self):
        """Print a summary of node types in the graph."""
        type_counts = defaultdict(int)
        for _, data in self.graph.nodes(data=True):
            type_counts[data.get("type", "unknown")] += 1
        
        print("\n[GraphEngine] Node Type Distribution:")
        for node_type, count in sorted(type_counts.items()):
            print(f"   {node_type:20s}: {count}")

    def _find_customer(self, cust_id: str) -> dict | None:
        for c in self._customers:
            if c["id"] == cust_id:
                return c
        return None

    def _find_dealer(self, dealer_id: str) -> dict | None:
        for d in self._dealers:
            if d["id"] == dealer_id:
                return d
        return None

    def _find_guarantor(self, guar_id: str) -> dict | None:
        for g in self._guarantors:
            if g["id"] == guar_id:
                return g
        return None

    # ── Node Styling Constants ──
    NODE_STYLES = {
        "customer": {"color": "#3b82f6", "shape": "dot", "base_size": 18},
        "device": {"color": "#f97316", "shape": "diamond", "base_size": 22},
        "dealer": {"color": "#10b981", "shape": "square", "base_size": 26},
        "bank_account": {"color": "#8b5cf6", "shape": "dot", "base_size": 16},
        "mobile": {"color": "#06b6d4", "shape": "triangle", "base_size": 16},
        "location": {"color": "#ec4899", "shape": "hexagon", "base_size": 24},
        "guarantor": {"color": "#f59e0b", "shape": "star", "base_size": 20},
        "loan_application": {"color": "#6366f1", "shape": "dot", "base_size": 18},
    }

    def _format_node(self, node_id: str, data: dict) -> dict:
        """Format node with visual attributes for vis-network."""
        node_type = data.get("type", "unknown")
        style = self.NODE_STYLES.get(node_type, {"color": "#94a3b8", "shape": "dot", "base_size": 16})
        risk = float(data.get("risk_score", 0))
        
        # Scale size by risk score
        scaled_size = round(style["base_size"] + (risk / 100.0) * 14)
        
        # Color based on risk if extreme, otherwise node-type color
        base_color = style["color"]
        if risk >= 80:
            border_color = "#dc2626"
            highlight_color = "#ef4444"
        elif risk >= 50:
            border_color = "#f59e0b"
            highlight_color = "#fbbf24"
        else:
            border_color = base_color
            highlight_color = base_color

        label = data.get("label", node_id)
        tooltip = f"<b>{label}</b><br/>Type: {node_type}<br/>Risk Score: {risk:.1f}/100"
        
        return {
            "id": node_id,
            "label": label,
            "type": node_type,
            "risk_score": risk,
            "color": {
                "background": base_color,
                "border": border_color,
                "highlight": {"background": highlight_color, "border": "#ffffff"},
            },
            "size": scaled_size,
            "shape": style["shape"],
            "title": tooltip,
            "metadata": {k: v for k, v in data.items() 
                        if k not in ("type", "label", "risk_score")},
        }

    # ── Query Methods ──

    def get_all_nodes(self, node_type: str | None = None, 
                      min_risk: float = 0,
                      max_risk: float = 100) -> list[dict]:
        """Get all nodes, optionally filtered by type and risk score range."""
        nodes = []
        for node_id, data in self.graph.nodes(data=True):
            if node_type and data.get("type") != node_type:
                continue
            risk = data.get("risk_score", 0)
            if risk < min_risk or risk > max_risk:
                continue
            nodes.append(self._format_node(node_id, data))
        return nodes

    def get_filtered_graph(
        self,
        node_types: list[str] | None = None,
        min_risk: float = 0,
        max_risk: float = 100,
        search: str | None = None,
        limit: int = 250,
        include_neighbors: bool = False,
        sort_order: str = "desc"
    ) -> tuple[list[dict], list[dict]]:
        """
        Advanced filtered graph query with neighbor expansion and limits.
        sort_order:
          "desc"  — highest risk first (default)
          "asc"   — lowest risk first
          "mixed" — stratified sample across risk tiers for representative view
        """
        candidate_ids = set()
        search_lower = search.lower() if search else None
        
        for node_id, data in self.graph.nodes(data=True):
            n_type = data.get("type", "")
            if node_types and n_type not in node_types:
                continue
            
            risk = data.get("risk_score", 0)
            if risk < min_risk or risk > max_risk:
                continue
            
            if search_lower:
                label = str(data.get("label", "")).lower()
                city = str(data.get("city", "")).lower()
                phone = str(data.get("phone", "")).lower()
                if search_lower not in node_id.lower() and search_lower not in label and search_lower not in city and search_lower not in phone:
                    continue
                    
            candidate_ids.add(node_id)
            
        # Optional 1-hop neighbor inclusion (only if explicitly requested)
        final_ids = set(candidate_ids)
        if include_neighbors and len(candidate_ids) < 300:
            for node_id in candidate_ids:
                for neighbor in self.graph.neighbors(node_id):
                    neighbor_risk = self.graph.nodes[neighbor].get("risk_score", 0)
                    if min_risk <= neighbor_risk <= max_risk:
                        final_ids.add(neighbor)
        
        # Format all candidate nodes (guaranteed to satisfy min_risk <= risk <= max_risk)
        all_formatted = [
            self._format_node(nid, self.graph.nodes[nid])
            for nid in final_ids if self.graph.has_node(nid)
        ]
        
        if sort_order == "mixed":
            # ── Stratified sampling across the filtered risk range ──
            effective_min = max(min_risk, 0)
            effective_max = min(max_risk, 100.0)
            tier_range = effective_max - effective_min
            
            if tier_range <= 2.0 or len(all_formatted) <= limit:
                selected_nodes = sorted(
                    all_formatted,
                    key=lambda n: n["risk_score"],
                    reverse=True
                )[:limit]
            else:
                # Create 4 equal tiers spanning the filtered range
                tier_width = tier_range / 4.0
                tiers = []
                for i in range(4):
                    t_min = effective_min + i * tier_width
                    t_max = effective_min + (i + 1) * tier_width if i < 3 else 101.0
                    weight = 0.15 + (i * 0.10)  # [0.15, 0.25, 0.35, 0.45]
                    tiers.append((t_min, t_max, weight))
                
                total_weight = sum(w for _, _, w in tiers)
                tiers = [(lo, hi, w / total_weight) for lo, hi, w in tiers]
                
                selected_nodes = []
                for tier_min, tier_max, tier_pct in tiers:
                    tier_budget = max(1, int(limit * tier_pct))
                    tier_nodes = [n for n in all_formatted if tier_min <= n["risk_score"] < tier_max]
                    tier_nodes.sort(key=lambda n: n["risk_score"], reverse=True)
                    selected_nodes.extend(tier_nodes[:tier_budget])
                
                # Fill remaining budget from any tier (highest risk first)
                already_ids = {n["id"] for n in selected_nodes}
                leftover = [n for n in all_formatted if n["id"] not in already_ids]
                leftover.sort(key=lambda n: n["risk_score"], reverse=True)
                remaining_budget = limit - len(selected_nodes)
                if remaining_budget > 0:
                    selected_nodes.extend(leftover[:remaining_budget])
        else:
            # Standard sort
            sort_descending = (sort_order != "asc")
            sorted_nodes = sorted(
                all_formatted,
                key=lambda n: n["risk_score"],
                reverse=sort_descending
            )
            selected_nodes = sorted_nodes[:limit]
        
        selected_ids = {n["id"] for n in selected_nodes}
        
        edges = []
        for u, v, data in self.graph.edges(data=True):
            if u in selected_ids and v in selected_ids:
                edges.append({
                    "from": u,
                    "to": v,
                    "relationship": data.get("relationship", "connected"),
                    "weight": data.get("weight", 1.0),
                })
                
        return selected_nodes, edges

    def get_all_edges(self) -> list[dict]:
        """Get all edges in the graph."""
        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                "from": u,
                "to": v,
                "relationship": data.get("relationship", "connected"),
                "weight": data.get("weight", 1.0),
            })
        return edges

    def get_node_detail(self, node_id: str) -> dict | None:
        """Get detailed information about a single node and its connections."""
        target_id = node_id
        if not self.graph.has_node(target_id):
            # Try common variations
            clean_id = node_id.upper().strip()
            candidates = []
            if clean_id.startswith("DEALER_"):
                num = clean_id.replace("DEALER_", "")
                candidates.extend([f"DLR_{num.zfill(5)}", f"DLR_{num.zfill(3)}", f"DLR_{num}"])
            elif clean_id.startswith("DLR_"):
                num = clean_id.replace("DLR_", "")
                candidates.extend([f"DLR_{num.zfill(5)}", f"DLR_{num.zfill(3)}"])
            elif clean_id.startswith("CUST_"):
                num = clean_id.replace("CUST_", "")
                candidates.extend([f"CUST_{num.zfill(5)}", f"CUST_{num.zfill(4)}"])
            elif clean_id.startswith("APP_"):
                num = clean_id.replace("APP_", "")
                candidates.extend([f"APP_{num.zfill(5)}"])
            
            for c in candidates:
                if self.graph.has_node(c):
                    target_id = c
                    break
            else:
                # Case insensitive check
                for n in self.graph.nodes:
                    if n.lower() == node_id.lower():
                        target_id = n
                        break
                else:
                    return None
        
        node_id = target_id
        data = self.graph.nodes[node_id]
        connections = []
        
        for neighbor in self.graph.neighbors(node_id):
            neighbor_data = self.graph.nodes[neighbor]
            edge_data = self.graph.edges[node_id, neighbor]
            connections.append({
                "id": neighbor,
                "label": neighbor_data.get("label", neighbor),
                "type": neighbor_data.get("type", "unknown"),
                "relationship": edge_data.get("relationship", "connected"),
            })
        
        formatted = self._format_node(node_id, data)
        return {
            "id": node_id,
            "label": formatted["label"],
            "type": formatted["type"],
            "risk_score": formatted["risk_score"],
            "color": formatted["color"],
            "size": formatted["size"],
            "shape": formatted["shape"],
            "connections": connections,
            "metadata": formatted["metadata"],
        }

    def get_subgraph(self, node_ids: list[str]) -> tuple[list[dict], list[dict]]:
        """Get a formatted subgraph containing only the specified nodes."""
        valid_ids = [nid for nid in node_ids if self.graph.has_node(nid)]
        subgraph = self.graph.subgraph(valid_ids)
        
        nodes = [self._format_node(nid, self.graph.nodes[nid]) for nid in subgraph.nodes()]
        
        edges = []
        for u, v, data in subgraph.edges(data=True):
            edges.append({
                "from": u,
                "to": v,
                "relationship": data.get("relationship", "connected"),
                "weight": data.get("weight", 1.0),
            })
        
        return nodes, edges

    def add_application(self, app_data: dict) -> str:
        """
        Add a new loan application to the graph (continuous learning).
        Returns the new application ID.
        """
        # Generate new application ID
        existing_apps = [n for n, d in self.graph.nodes(data=True) 
                        if d.get("type") == "loan_application"]
        new_id = f"APP_{str(len(existing_apps) + 1).zfill(5)}"
        
        # Add all nodes and edges (same logic as build_graph but for one app)
        app_data["id"] = new_id
        self._applications.append(app_data)
        
        # Add application node
        self.graph.add_node(new_id, **{
            "type": "loan_application",
            "label": new_id,
            "loan_amount": app_data.get("loan_amount", 0),
            "status": "pending",
            "payment_status": "current",
            "risk_score": 0,
        })
        
        # Add/connect to other entities
        cust_id = app_data.get("customer_id", f"CUST_NEW_{new_id}")
        if not self.graph.has_node(cust_id):
            self.graph.add_node(cust_id, **{
                "type": "customer",
                "label": app_data.get("applicant_name", cust_id),
                "risk_score": 0,
            })
        
        dev_fp = app_data.get("device_fingerprint", "")
        dev_node_id = f"DEV_{dev_fp[:12]}"
        if not self.graph.has_node(dev_node_id):
            self.graph.add_node(dev_node_id, **{
                "type": "device",
                "label": f"Device ...{dev_fp[:8]}",
                "fingerprint": dev_fp,
                "risk_score": 0,
            })
        
        dealer_id = app_data.get("dealer_id", "")
        guarantor_id = app_data.get("guarantor_id", "")
        phone = app_data.get("phone", "")
        location = app_data.get("location", "")
        bank_account = app_data.get("bank_account", "")
        
        mob_node_id = f"MOB_{phone}"
        if not self.graph.has_node(mob_node_id):
            self.graph.add_node(mob_node_id, **{
                "type": "mobile",
                "label": f"Mobile {phone[:5]}...{phone[-4:]}",
                "risk_score": 0,
            })
        
        loc_node_id = f"LOC_{location.replace(' ', '_').replace(',', '')}"
        if not self.graph.has_node(loc_node_id):
            self.graph.add_node(loc_node_id, **{
                "type": "location",
                "label": location,
                "risk_score": 0,
            })
        
        bank_node_id = f"BANK_{bank_account.replace('-', '_')}"
        if not self.graph.has_node(bank_node_id):
            self.graph.add_node(bank_node_id, **{
                "type": "bank_account",
                "label": bank_account,
                "risk_score": 0,
            })
        
        # Add edges
        self.graph.add_edge(cust_id, new_id, relationship="applied_for", weight=1.0)
        self.graph.add_edge(cust_id, dev_node_id, relationship="uses_device", weight=1.0)
        self.graph.add_edge(cust_id, mob_node_id, relationship="owns_mobile", weight=1.0)
        
        if self.graph.has_node(dealer_id):
            self.graph.add_edge(cust_id, dealer_id, relationship="applied_through", weight=1.0)
            self.graph.add_edge(new_id, dealer_id, relationship="processed_by", weight=0.8)
        
        if self.graph.has_node(guarantor_id):
            self.graph.add_edge(cust_id, guarantor_id, relationship="guaranteed_by", weight=1.0)
        
        self.graph.add_edge(cust_id, bank_node_id, relationship="uses_bank_account", weight=1.0)
        self.graph.add_edge(cust_id, loc_node_id, relationship="located_at", weight=1.0)
        
        return new_id

    def get_stats(self) -> dict:
        """Get summary statistics for the dashboard."""
        type_counts = defaultdict(int)
        risk_scores = []
        high_risk_count = 0
        
        for _, data in self.graph.nodes(data=True):
            node_type = data.get("type", "unknown")
            type_counts[node_type] += 1
            risk = data.get("risk_score", 0)
            risk_scores.append(risk)
            if risk >= 70:
                high_risk_count += 1
        
        # Count connected components as "networks"
        components = list(nx.connected_components(self.graph))
        total_networks = len([c for c in components if len(c) > 2])
        
        avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 0
        
        return {
            "total_applications": type_counts.get("loan_application", 0),
            "total_customers": type_counts.get("customer", 0),
            "total_networks": total_networks,
            "suspicious_networks": 0,  # will be set by fraud_ring_detector
            "critical_networks": 0,    # will be set by fraud_ring_detector
            "high_risk_count": high_risk_count,
            "avg_risk_score": round(avg_risk, 2),
        }

    @staticmethod
    def _load_json(filename: str) -> list:
        """Load a JSON file from the generated data directory."""
        filepath = DATA_DIR / filename
        if not filepath.exists():
            print(f"[GraphEngine Warning] File not found: {filepath}. Run generate_synthetic_data.py first.")
            return []
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)


# ── Singleton instance ──
_sentinel_graph: SentinelGraph | None = None


def get_sentinel_graph() -> SentinelGraph:
    """Get or create the singleton SentinelGraph instance."""
    global _sentinel_graph
    if _sentinel_graph is None:
        _sentinel_graph = SentinelGraph()
        _sentinel_graph.load_data()
        _sentinel_graph.build_graph()
    return _sentinel_graph


def reset_graph():
    """Reset the graph (useful for testing)."""
    global _sentinel_graph
    _sentinel_graph = None
