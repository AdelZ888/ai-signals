---
title: "Reconstructing E-fields from FEM electromagnetic solves using Nédélec edge-element DOFs"
date: "2026-10-04"
excerpt: "Practical guide to export FEM EM solver DOFs and mesh, then reconstruct pointwise E(x) with Nédélec edge basis — why node-based extraction yields wrong fields and how to fix it."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-04-reconstructing-e-fields-from-fem-electromagnetic-solves-using-nedelec-edge-element-dofs.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "FEM"
  - "electromagnetics"
  - "Nédélec"
  - "mesh"
  - "simulation"
  - "machine-learning"
  - "data-extraction"
sources:
  - "https://www.arenaphysica.com/publications/fem-edge-elements"
---

## TL;DR in plain English

- Standard FEM electromagnetic (EM) solvers do not store the electric field E at mesh vertices. Instead they use edge-based degrees of freedom (DOFs) implemented by Nédélec "edge" elements; that is the explanation in Arena Physica's note: https://www.arenaphysica.com/publications/fem-edge-elements
- If you try to collect or reconstruct E(x) by treating the solution as a set of scalar nodal values and interpolating, you will produce incorrect, discontinuous, or systematically biased pointwise fields. The Arena Physica write-up explains why node-based intuition fails for EM: https://www.arenaphysica.com/publications/fem-edge-elements
- The correct practical workflow is to export the solver's global DOF vector plus mesh topology and to rebuild E(x) by evaluating the element edge (vector) shape functions at your sample points and contracting them with the DOFs: https://www.arenaphysica.com/publications/fem-edge-elements

Methodology note: this document follows the Arena Physica explanation and focuses on extracting the DOF vector and reconstructing fields externally rather than modifying solver internals: https://www.arenaphysica.com/publications/fem-edge-elements

## What you will build and why it helps

You will build a minimal, reproducible extraction-and-reconstruction pipeline that:

- Exports mesh geometry and element connectivity from your FEM EM solver.
- Exports the global DOF vector and a DOF->mesh association (dof_map) that shows which DOF lives on which edge/face.
- Reconstructs pointwise electric field samples E(x) by evaluating Nédélec (edge) vector basis functions on each element and contracting them with the corresponding DOF coefficients.

Why this matters: EM finite-element solutions live in H(curl). Nédélec edge elements place DOFs on edges to enforce tangential continuity, so the solver's numerical degrees of freedom are not per-vertex scalar values. Arena Physica documents this distinction and the consequences for naive interpolation: https://www.arenaphysica.com/publications/fem-edge-elements

Artifact table (decision frame)

| Artifact | Purpose | Typical format |
|---:|---|---|
| mesh.msh | geometry + connectivity | Gmsh / .msh / solver native |
| dof_vector.json | ordered global DOFs | JSON array of floats |
| dof_map.json | DOF -> edge/element mapping | JSON indices and local ordering |
| samples.csv | sampling coordinates | CSV xyz rows |
| reconstructed_E.npy | reconstructed point E(x) | Nx3 float32 NumPy array |

Reference: https://www.arenaphysica.com/publications/fem-edge-elements

## Before you start (time, cost, prerequisites)

- Read the Arena Physica note to confirm the DOF vs node distinction before designing your export: https://www.arenaphysica.com/publications/fem-edge-elements
- Prerequisites: a solver that can export the global DOF vector and mesh connectivity (or a plugin/API to extract them), and basic scripting (Python, bash) to run the reconstruction.
- Pre-run checklist
  - [ ] Confirm the solver can export the global DOF vector and element connectivity (dof_map).
  - [ ] Identify whether the element family is Nédélec/edge-based (H(curl)) or nodal.
  - [ ] Prepare a small analytic or high-confidence reference case for validation.

Reference: https://www.arenaphysica.com/publications/fem-edge-elements

## Step-by-step setup and implementation

1. Confirm solver exports
   - Verify the solver can write the global DOF vector and element connectivity. Arena Physica explains why the DOF vector is the primary artifact you need for EM postprocessing: https://www.arenaphysica.com/publications/fem-edge-elements

2. Run a small reference solve
   - Use a simple case (rectangular cavity, waveguide segment, or another analytic-mode case) and export mesh + DOFs + dof_map.

3. Inspect DOF associations
   - Parse dof_map.json to see whether DOFs are attached to edges, faces, or nodes. If DOFs are edge-associated (Nédélec), proceed with edge-aware reconstruction as described in the Arena Physica note: https://www.arenaphysica.com/publications/fem-edge-elements

4. Implement the reconstruction
   - For each element, evaluate the element's vector (edge) shape functions phi_i(x) at sampling points inside that element and contract with local DOF coefficients a_i:

     E(x) = sum_i a_i phi_i(x)

   - This preserves the tangential continuity enforced by the H(curl) function space. See: https://www.arenaphysica.com/publications/fem-edge-elements

5. Validate and compute metrics
   - Compare reconstructed E(x) with solver probe outputs or analytic benchmarks on a small set of probe points. Compute L2 or max-norm error metrics on that probe set.

6. Automate and version
   - Put the mesh -> DOF -> sampling -> reconstruction pipeline under version control and store one canonical reference case.

Example export command (adapt to your solver):

```bash
# pseudo exporter — replace with your solver's CLI or API
solver_cli run --case small_ref.case \
  --export-mesh mesh.msh \
  --export-dofs dof_vector.json \
  --export-dofmap dof_map.json
```

Example JSON config for the reconstruction run:

```json
{
  "mesh": "mesh.msh",
  "dof_vector": "dof_vector.json",
  "dof_map": "dof_map.json",
  "samples": "samples.csv",
  "element_order": 1,
  "reconstruction": {"method": "edge-shape-eval"}
}
```

Reference: https://www.arenaphysica.com/publications/fem-edge-elements

## Common problems and quick fixes

- Exported values misinterpreted as nodal
  - Fix: consult dof_map.json and confirm DOF attachments. If DOFs are edge-based, evaluate edge vector shape functions rather than performing nodal interpolation. See: https://www.arenaphysica.com/publications/fem-edge-elements

- Fields appear discontinuous across interfaces
  - Fix: ensure reconstruction uses H(curl)-conforming basis (edge elements) so tangential continuity holds. Reference: https://www.arenaphysica.com/publications/fem-edge-elements

- Coordinate or unit mismatch
  - Fix: compare solver probe coordinates to sample coordinates and check mesh units and origin.

- Solver exposes only integrated quantities (surface/volume integrals)
  - Fix: export the DOF vector and perform local basis evaluation to obtain pointwise values.

Debug checklist

- [ ] Confirm DOF count equals the length of dof_vector.json.
- [ ] Verify elements referenced in dof_map exist in mesh.msh.
- [ ] Run 3–5 probe comparisons and inspect L2 / max errors.

Reference: https://www.arenaphysica.com/publications/fem-edge-elements

## First use case for a small team

Scenario: produce a pilot dataset for model development that preserves correct field structure.

Roles and short plan

- Engineer: automate solver runs and DOF exports.
- Data engineer / ML: implement reconstruction and pack samples into dataset files.
- Researcher: design sampling probe locations and analytic validation checks.

Operational tips

- Lock one canonical case and dataset schema in Git.
- Run a small canary batch and verify reconstruction metrics before scaling.
- Store human-readable metadata with each exported case (mesh_id, solver version, units).

Reference: https://www.arenaphysica.com/publications/fem-edge-elements

## Technical notes (optional)

- Why a node-based mental model fails: Nédélec (edge) elements place DOFs on edges so the discrete field enforces tangential continuity across faces — this is why simply interpolating vector components from nodal values is incorrect for EM: https://www.arenaphysica.com/publications/fem-edge-elements

- Reconstruction concept (per-element):

  E(x) = sum_i a_i phi_i(x)

  where phi_i are vector edge basis functions and a_i are the local DOF coefficients taken from the global DOF vector and dof_map. See: https://www.arenaphysica.com/publications/fem-edge-elements

Small pseudo-Python sketch:

```python
# pseudo-code — adapt to your element definitions
phi = evaluate_edge_shape_functions(element, points)  # shape (M, n_basis, 3)
local_dofs = gather_local_dofs(dof_vector, dof_map, element)  # (n_basis,)
E_points = (phi * local_dofs[None, :, None]).sum(axis=1)  # (M,3)
```

Reference: https://www.arenaphysica.com/publications/fem-edge-elements

## What to do next (production checklist)

### Assumptions / Hypotheses

- Pilot run: 1 canonical reference case to validate the flow (count = 1).
- Pilot time estimate: 4 hours to 24 hours for a local proof-of-concept (4 h–24 h).
- Pilot QA scale: validate on 100 cases before broader scaling (100 cases).
- Scale target for planning: 10,000 cases as a budgetary planning figure (10,000 cases).
- Storage estimate for planning: 100s of GB for thousands of meshes and reconstructed samples (~100–500 GB).
- Probe validation: 5 probe points per run for quick sanity checks (5 points).
- Acceptance thresholds for pilot (examples to validate): probe L2 error < 1e-3, probe max error < 1e-2, metadata completeness 100%.
- Team size example for fast rollout: 3–4 people (3–4 persons).
- Budgetary placeholder: $2,000–$20,000 depending on cloud compute and storage choices.
- Tokenization / dataset size planning: if converting field data to learned representations, plan for 4,096–8,192 token-equivalent feature lengths for some model inputs (4,096–8,192 tokens).

(These are planning hypotheses to be validated during the pilot.)

### Risks / Mitigations

- Risk: ambiguous DOF ordering or inconsistent dof_map formats across solver versions.
  - Mitigation: require an explicit dof_map that maps global DOF indices to element/edge indices. Validate ordering on 1–10 canonical canaries.

- Risk: coordinate system or units mismatch causes silent scale errors.
  - Mitigation: include an automated coordinate/unit consistency check and compare 3–5 known probe points per run.

- Risk: downstream models trained on incorrectly reconstructed targets.
  - Mitigation: keep a holdout set of parameterized analytic cases and enforce a canary gate with L2 / max error checks before dataset releases.

- Risk: storage or compute cost overruns when scaling.
  - Mitigation: perform a controlled pilot and collect cost metrics; implement quotas and compressed storage for meshes and samples.

### Next steps

1. Run the single-case canary (N=1) and validate reconstruction against solver probes.
2. Lock dataset schema and reconstruction code in Git; tag a pilot release and archive mesh + dof_map for reproducibility.
3. Add automated QA that computes L2 and max error on probe points and blocks releases if thresholds are unmet.
4. If canary passes, run a controlled pilot of ~100 cases, collect cost and storage metrics, then decide on scale-out.

Reference and background: https://www.arenaphysica.com/publications/fem-edge-elements
