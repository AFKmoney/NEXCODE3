# NEXUS-IDE Infrastructure & Deployment

This document describes the DevOps and Infrastructure as Code (IaC) setup for the NexusCode Mobile IDE platform, designed for industrial, high-availability deployments.

## 1. Cloud-Native Provisioning (Terraform)

The `terraform/` directory contains standard AWS configurations to spin up a fully managed EKS (Elastic Kubernetes Service) cluster and its surrounding VPC architecture.

### Setup Instructions
1. Navigate to the `terraform/` directory.
2. Initialize terraform providers: `terraform init`
3. Plan the deployment: `terraform plan -var="aws_region=eu-west-3"`
4. Apply to AWS: `terraform apply`

This provisions:
- 3-AZ VPC with public and private subnets.
- NAT Gateways for secure outward bound traffic.
- EKS Cluster (1.28) with `t3.medium` and `t3.large` worker nodes autoscaled (2 to 5 instances).

## 2. Kubernetes Orchestration (Helm)

The `helm/nexus-ide` directory contains the Helm chart to deploy the Next.js application, Wasm binaries, and its load balancer in Kubernetes.

### Deployment Instructions
Assuming `kubectl` is configured to point to your EKS cluster:
1. Navigate to `helm/`.
2. Install the release: 
   `helm upgrade --install nexus-ide ./nexus-ide --namespace nexus-prod --create-namespace`

Key features of this Helm chart:
- **Autoscaling (HPA):** Scales up to 10 replicas on CPU/Memory pressure.
- **Ingress Controller:** Ready for NGINX with Let's Encrypt certificates (`cert-manager.io/cluster-issuer`).
- **Health Probes:** Readiness and Liveness probes defined for zero-downtime rollouts.

## 3. Edge Computing (Vercel)

For Edge caching of the static assets and the Rust `.wasm` binaries, a `vercel.json` is provided at the root.

- Deploys automatically to `cdg1` (Paris), `lhr1` (London), and `iad1` (Washington D.C.).
- Caches the `wasm/` route for 1 year with immutable headers to guarantee instant load times for returning developers.

To deploy via Vercel:
`vercel --prod`
