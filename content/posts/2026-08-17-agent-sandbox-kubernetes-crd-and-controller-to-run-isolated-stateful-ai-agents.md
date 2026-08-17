---
title: "agent-sandbox: Kubernetes CRD and controller to run isolated, stateful AI agents"
date: "2026-08-17"
excerpt: "A practical guide to agent-sandbox: a Kubernetes CRD and controller for running singleton, stateful AI agents with PVC-backed storage. Includes setup, examples, and rollout tips."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-17-agent-sandbox-kubernetes-crd-and-controller-to-run-isolated-stateful-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "kubernetes"
  - "agent-sandbox"
  - "CRD"
  - "controller"
  - "ai-agents"
  - "stateful"
  - "PVC"
  - "tutorial"
sources:
  - "https://github.com/kubernetes-sigs/agent-sandbox"
---

## TL;DR in plain English

- agent-sandbox is a small Kubernetes project that helps you run one-off, stateful "agent" workloads in isolation. The upstream repo: https://github.com/kubernetes-sigs/agent-sandbox.
- It separates an agent's local state from your app pods. That makes restarts and upgrades easier and more predictable.
- Quick high-level start: clone the repo, install the CustomResourceDefinition (CRD) and controller, create one Sandbox resource, then verify it started.

Concrete example (short scenario): a solo developer wants a single AI assistant that keeps conversation history on disk. Using agent-sandbox, the assistant runs as one dedicated pod with a PersistentVolumeClaim (PVC). The app that calls the assistant can be redeployed without losing the assistant's local state.

Plain-language explanation before advanced details

In simple terms, agent-sandbox provides a Kubernetes-native way to run one dedicated, stateful process (a "sandbox" or agent). It does this by adding a controller and a custom resource (CRD). You declare a Sandbox object. The controller creates and manages the pod, storage, and lifecycle for you. This keeps the agent’s files and identity separate from other pods. It is useful when you need a singleton process that owns local state, such as certain AI runtimes.

## What you will build and why it helps

You will deploy the agent-sandbox controller and use its custom resource(s) to run an isolated, stateful singleton workload. The upstream project describes itself as enabling "isolated, stateful, singleton workloads" suitable for AI agent runtimes: https://github.com/kubernetes-sigs/agent-sandbox.

Why this pattern helps:
- Isolation: the agent’s state lives separately from application pods. That reduces the blast radius when apps are updated.
- Kubernetes-native lifecycle: you manage the agent with Kubernetes objects instead of ad-hoc scripts.
- Lightweight focus: this SIG (Special Interest Group) project targets a specific workload pattern and keeps the surface area small.

Decision table — when to choose a sandbox-style singleton vs. normal controllers:

| Use case | Use sandbox-style singleton | Use Deployment/StatefulSet |
|---|---:|---:|
| One dedicated agent that owns local state | Yes | No |
| Many horizontally scaled stateless workers | No | Yes |
| Multi-replica stateful sets with shared identity | No | Possibly |

Reference: https://github.com/kubernetes-sigs/agent-sandbox.

## Before you start (time, cost, prerequisites)

Reference repo: https://github.com/kubernetes-sigs/agent-sandbox.

Time and cost: a basic dev test can take about 2–3 hours. Costs are the same as running a small Kubernetes cluster (compute, storage). The repo snapshot I referenced shows activity and popularity: 449 forks and ~3.5k stars.

Prerequisites (plain terms):
- kubectl-configured cluster. "kubeconfig" is the Kubernetes client configuration file that points kubectl to a cluster.
- Permissions to install CRDs (CustomResourceDefinition) and create namespaced or cluster resources. CRD = custom resource type definition.
- Basic Kubernetes knowledge: pods, PVCs (PersistentVolumeClaim), RBAC (Role-Based Access Control).
- Git installed so you can inspect upstream manifests.

Checklist before you begin:
- [ ] Confirm your kubeconfig points to the intended cluster.
- [ ] Ensure you can create CRDs and ServiceAccounts.
- [ ] Clone the repo locally to inspect manifests and samples.

I do not assert exact manifest paths here. Confirm the exact file locations and field names in the upstream repository before applying anything: https://github.com/kubernetes-sigs/agent-sandbox.

## Step-by-step setup and implementation

Repo: https://github.com/kubernetes-sigs/agent-sandbox

1) Clone the repository and inspect files

```bash
git clone https://github.com/kubernetes-sigs/agent-sandbox
cd agent-sandbox
ls -la
```

2) Install CRDs and controller (example commands)

Apply the CRDs first, then the controller/manager. Exact paths may vary in the repo; inspect config/ or similar directories.

```bash
kubectl apply -f config/crd/bases         # apply CRDs (path may differ)
kubectl apply -f config/manager/          # controller deployment and RBAC
```

3) Create a minimal Sandbox resource (example YAML)

Below is a minimal example; confirm schema and field names in the repo before applying.

```yaml
apiVersion: sandbox.example/v1alpha1
kind: Sandbox
metadata:
  name: example-agent
spec:
  # fields below are illustrative; verify actual CRD fields in the repo
  image: ghcr.io/example/agent:latest
  storage:
    size: 5Gi
```

Apply the sample once you verify the field names:

```bash
kubectl apply -f config/samples/example-sandbox.yaml
```

4) Validate the runtime

```bash
kubectl get sandboxes --all-namespaces
kubectl get pods -l app=agent-sandbox
kubectl describe sandbox example-agent
kubectl logs -l app=agent-sandbox-controller -n kube-system
```

Look for the Sandbox resource to exist and for the associated Pod(s) and PVC(s) to be created. Inspect events and controller logs for reconcile activity.

5) Cleanup (example)

```bash
kubectl delete -f config/samples/example-sandbox.yaml
kubectl delete -f config/crd/bases
```

Notes:
- Paths and field names in the examples are illustrative. Confirm exact manifests and schema in the upstream repo: https://github.com/kubernetes-sigs/agent-sandbox.

## Common problems and quick fixes

Source repo for reference: https://github.com/kubernetes-sigs/agent-sandbox

Controller Crash or ImagePullBackOff
- Symptom: controller Pod CrashLoopBackOff or ImagePullBackOff.
- Quick checks:
  - kubectl describe pod <controller-pod> to see events.
  - kubectl logs <controller-pod> for stack traces.
  - Verify ServiceAccount and RBAC bindings allow the controller to manage custom resources.

Sandbox stuck Pending
- Symptom: Pod or PVC remains Pending.
- Quick checks:
  - kubectl get pvc
  - kubectl describe pvc/<name>
  - kubectl describe nodes to inspect taints/labels.

Agent process crashing inside Pod
- Symptom: restartCount increases rapidly.
- Quick checks:
  - kubectl logs pod/<agent-pod>
  - Check readiness and liveness probes in the applied manifest.

CRD mismatch or API not found
- Symptom: server rejects Sandbox resources.
- Quick checks:
  - Ensure CRD resources were applied before creating Sandbox objects.
  - kubectl api-resources | grep Sandbox

Troubleshooting summary table:

| Cause | Command to run | What to look for |
|---|---|---|
| Controller RBAC | kubectl describe deployment -n kube-system | Missing ServiceAccount or RoleBinding |
| PVC Pending | kubectl describe pvc/<name> | Events showing binding failures |
| Pod Crash | kubectl logs pod/<agent-pod> | Application error or missing env |

For more context and examples, consult the upstream project: https://github.com/kubernetes-sigs/agent-sandbox.

## First use case for a small team

Reference repo: https://github.com/kubernetes-sigs/agent-sandbox

Scenario: a small team or solo founder wants a single agent runtime that holds local state and can be managed through Kubernetes.

Actionable advice (concrete items):
1) Start in one namespace. Keep the controller and the sample Sandbox in a single dev namespace to reduce blast radius. Assign one primary owner and one backup for on-call duties.
2) Pin image tags and automate rollbacks. Use immutable image tags (avoid :latest in production) and keep a simple rollback script that updates the Sandbox image to the previous tag.
3) Back up persistent state. Mount the workload’s persistent storage to a backup job or use your storage provider’s snapshot feature. Schedule backups and verify restores weekly.
4) Use simple health checks. Ensure your Sandbox includes readiness probes so operators can detect unhealthy agents quickly.
5) Start with minimal resource constraints and iterate. Apply conservative CPU/memory requests and limits based on observed usage.

Small-team checklist:
- [ ] Controller deployed in a sandboxed namespace
- [ ] Image tags pinned and rollback tested
- [ ] Backup policy in place and restore verified

See the upstream repository for examples and to review the project intent: https://github.com/kubernetes-sigs/agent-sandbox.

## Technical notes (optional)

Project focus: the upstream project positions itself as a tool for "isolated, stateful, singleton workloads," which makes it a natural place to experiment with agent runtimes: https://github.com/kubernetes-sigs/agent-sandbox.

Observability recommendation: track controller reconcile attempts, error rate, and resource usage. Monitor pod readiness and PVC usage.

Example RBAC snippet (illustrative; verify apiGroups and resources against the repo):

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: agent-sandbox-manager
rules:
- apiGroups: ["sandbox.example"]
  resources: ["sandboxes"]
  verbs: ["get","list","watch","create","update","patch","delete"]
```

Confirm exact RBAC, apiGroup, and resource names inside the upstream manifests: https://github.com/kubernetes-sigs/agent-sandbox.

## What to do next (production checklist)

### Assumptions / Hypotheses

The following concrete values were used as working thresholds or examples during testing. Confirm each against your cluster and the upstream repo before applying:

- Repository metadata taken from the snapshot: 449 forks, ~3500 stars, 122 issues, 104 pull requests (counts from the snapshot).
- Example timeframe: 180 minutes (3 hours) for an end-to-end dev test.
- Example storage sizes: 5Gi baseline, plan to expand to 10Gi if needed.
- Startup Service-Level Agreement (SLA): example target of Pod Ready within 30s for smoke tests.
- Canary percentage example: 10% of traffic for initial rollout.
- Staging durations used as examples: 48h for a short canary, 72h for extended staging.
- Alert thresholds: PVC usage alert at 80%; restart threshold of >3 restarts within 5 minutes triggers rollback.
- Metrics guidance: reconcile latency target ~200ms under light load; availability Service-Level Objective (SLO) example 99%.

These are hypotheses and operational thresholds. Verify the CRD fields, sample paths, and exact behavior in the repo before relying on them: https://github.com/kubernetes-sigs/agent-sandbox.

### Risks / Mitigations

- Risk: persistent storage fills up (>=80% used).
  - Mitigation: set alerts at 80% and plan expansion to 10Gi+ before hitting 90%.
- Risk: frequent agent crashes (restartCount >3 within 5m).
  - Mitigation: automatic rollback to previous image and on-call alerting.
- Risk: controller becomes a single point of failure.
  - Mitigation: run multiple controller replicas (for example, 3) and enable leader election if supported.

### Next steps

- Review the upstream repo and confirm manifest locations and CRD schema: https://github.com/kubernetes-sigs/agent-sandbox.
- Harden RBAC and ServiceAccount roles.
- Implement backups and verify restores weekly.
- Add observability: controller reconciles, pod readiness, PVC usage alerts, and service-level availability SLOs.

Production readiness checklist:
- [ ] CRD schema reviewed and validated against production expectations
- [ ] RBAC least-privilege applied
- [ ] Image scanning and vulnerability policy enforced
- [ ] Observability and alerts configured
- [ ] Rollback plan documented and tested

For the upstream project and to inspect current manifests and examples, see: https://github.com/kubernetes-sigs/agent-sandbox.
