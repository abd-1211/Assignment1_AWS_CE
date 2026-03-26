# Assignment1_AWS_CE

## Project Overview

**Eventmanager** is a backend application that fetches and displays event data from the **Ticketmaster API**. The backend is written in Node.js and the frontend is a simple HTML/CSS/JS interface that fetches data from the backend.

The project is deployed on **AWS** using:  
- **EC2 instances** (private)  
- **VPC with public and private subnets**  
- **NAT Gateway** for private instances’ internet access  
- **Application Load Balancer (ALB)** for load balancing  
- **Security Groups** for controlled access  


---

## Table of Contents

1. [Project Setup]  
2. [Backend Setup]  
3. [Frontend Setup]  
4. [AWS Infrastructure]  
5. [EC2 Instances Deployment]  
6. [Application Load Balancer (ALB)]  
7. [Testing]  
8. [AWS S3]
8. [Security and Access]  
9. [Troubleshooting]  
10. [Conclusion]  

---

## Project Setup

1. Created project folder `Assignment1_AWS_CE` with **backend** and **frontend** directories.  
2. Backend: Node.js + Axios + Express for handling API calls.  
3. Frontend: Simple HTML/CSS/JS files to fetch data from backend.  
4. Used **WSL** (Windows Subsystem for Linux).

---

## Backend Setup

1. Created `.env` file in backend folder:

```bash
echo "API_KEY=<YOUR_TICKETMASTER_API_KEY>" > .env
```

2. Installed Dependencies

```bash
npm install axios express dotenv
```

3. Created `Server.js`



4. Created `fetchEvents.js`


## Frontend Setup

1. Created `index.html`


2. Created `app.js`


## AWS Infrastructure

- **VPC:** CIDR `10.0.0.0/16`  

- **Subnets:**
  - **Public Subnet:** hosts ALB and NAT Gateway  
  - **Private Subnets:** host EC2 instances in two Availability Zones  

- **Internet Gateway:** provides internet access to public subnet  

- **NAT Gateway:** allows outbound internet access for private EC2 instances  

### Security Groups

- **ALB Security Group:**
  - Inbound: HTTP port 80  
  - Outbound: to EC2 instances on port 3000  

- **EC2 Security Group:**
  - Inbound: from ALB Security Group on port 3000  
  - Outbound: to NAT Gateway for internet access  


### AWS Resource Table

  | Resource      | Description                                |
| ------------- | ------------------------------------------ |
| VPC           | Custom VPC for isolation                   |
| Subnets       | Public and private subnets in 2 AZs        |
| Internet GW   | For public subnet access                   |
| NAT Gateway   | For private EC2 internet access            |
| EC2 Instances | Two private instances with Node.js backend |
| Target Group  | Registered EC2 instances                   |
| ALB           | Routes requests to backend EC2s            |
| IAM User      | Permissions: EC2, S3, VPC, ELB             |


## EC2 Instances Deployment

1. Launched two private EC2 Instances `(Amazon Linux 2023)` in private subnets.

2. Created Keypairs `(Eventmanager-Key.pem)`

3. **Bastion Host:**  
   - Launched a public EC2 instance in the public subnet to serve as a bastion host.  
   - Used this instance to SSH into the private EC2 instances securely.  
   - Key pair: `Eventmanager-Key.pem`  
   - Security Group: allows SSH (port 22) from your local IP.

4. Installed `Node.js` and `Git`

5. Copied backend repo to both EC2 instances

6. Added `.env` with Ticketmaster API Key

7. Installed dependencies:

```bash
	npm install
```

8. Started Backend with 

```bash
	node server.js
```

9. Initialized a *WSL Client* to verify connection to both EC2 Instances

10. Verified backend through WSL Client:

```bash
	curl http://localhost:3000/events
```

## Application Load Balancer (ALB)

- Created an **ALB** in the **public subnets**.
- Configured **listener**:
  - Protocol: HTTP  
  - Port: 80  
  - Action: Forward to Target Group
- Created **Target Group**:
  - Protocol: HTTP  
  - Port: 3000  
  - Registered both private EC2 instances
- Waited for **health checks** → instances became healthy
- **ALB DNS** now routes traffic to the private backend EC2 instances

## Testing

1. On EC2 Instance:
	```bash
		curl http://localhost:3000/events
	```
2. From ALB DNS:
	```bash
		curl http://<ALB-DNS-Name>/events
	```

## AWS S3

Event posters and images are stored in a private S3 bucket `eventmanager-poster-store` in `ap-south-1`.  

- Backend uploads images using `s3.putObject` and returns **signed URLs** in the JSON `image` field.  
- EC2 instances require an IAM policy with:

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject","s3:GetObject"],
  "Resource": "arn:aws:s3:::eventmanager-poster-store/*"
}
```


## Security and Access

- EC2 instances are private, not publicly accessible.
- ALB exposes only HTTP port 80.
- NAT Gateway provides outbound internet access for private EC2 instances.
- WSL used instead of PuTTY for a better terminal and Linux environment.

---

## Troubleshooting

- Server exits → use `nohup node server.js &`
- Invalid API key → check `.env` file
- ALB health check failing → check security groups and ensure server is running
- Git/npm not found → install Node.js and Git on EC2 instances

---

## Justification of Design Choices

**VPC with Public and Private Subnets:**  
Private subnets secure backend EC2 instances from direct internet access, while the public subnet hosts the ALB and NAT Gateway. Alternatives like a single public subnet would expose instances to the internet, reducing security.

**EC2 Instances for Backend:**  
EC2 provides full control over Node.js environment and dependencies. Alternatives like Lambda were avoided because persistent server processes and multiple concurrent connections are required.

**Bastion Host:**  
Allows secure SSH access to private EC2 instances without exposing them publicly. Alternatives like direct public access would compromise security.

**Application Load Balancer (ALB):**  
Distributes traffic evenly across multiple backend EC2 instances, ensuring high availability. Alternatives like a single EC2 with public IP would create a single point of failure.

**Target Groups:**  
ALB uses target groups to manage and health-check EC2 instances efficiently. Using a static IP target or DNS without health checks could lead to routing requests to failed servers.

**NAT Gateway:**  
Provides outbound internet access for private EC2 instances to fetch API data or updates. Alternatives like proxy servers are more complex and less integrated with AWS best practices.

**IAM Roles and Policies:**  
EC2 instances need permissions for S3 and other AWS services. Using IAM roles is more secure than embedding permanent credentials in code.

**AWS S3 for Event Posters:**  
Provides secure, scalable storage with signed URLs for private access. Local storage or EC2 storage would be insecure, non-scalable, and fail in multi-instance setups.

**Ticketmaster API:**  
Provides reliable, structured event data with images and metadata. Other APIs like Eventbrite were considered but may not provide consistent coverage or free access for testing.

**Node.js Backend:**  
Asynchronous architecture is ideal for API calls and file uploads. Alternatives like PHP or Python could work, but Node.js is lightweight and integrates seamlessly with frontend fetch calls.

**HTTP-server for Frontend:**  
Serves static HTML, CSS, and JS for students without complex server setup. Alternatives like Nginx or S3 static hosting were avoided for simplicity during this assignment.

**WSL instead of PuTTY:**  
Provides a native Linux-like terminal environment on Windows, simplifying Node.js and Git commands. PuTTY could only manage SSH sessions and lacks a full Linux environment.


## Conclusion

- Complete Node.js backend and frontend setup.
- Integrated with Ticketmaster API for live event data.
- AWS deployment includes VPC, subnets, EC2 instances, NAT Gateway, ALB, security groups and S3.
- Application is load-balanced, highly available, and secure.



