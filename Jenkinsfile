pipeline {
    agent any

    environment {
        NODE_ENV = 'production' // Set the environment variable for Node.js
        DOCKER_IMAGE = 'node-price-scraper' // Name of the Docker image to build
        GCP_PROJECT = 'your-gcp-project-id' // Replace with your GCP project ID
        GCP_ZONE = 'your-gcp-zone' // Replace with your GCP zone (e.g., us-central1-a)
        GCP_VM_NAME = 'your-vm-name' // Replace with your VM instance name
    }

    stages {
        stage('Start GCP VM') {
            steps {
                script {
                    // Start the GCP VM instance
                    sh "gcloud compute instances start ${GCP_VM_NAME} --zone=${GCP_ZONE} --project=${GCP_PROJECT}"
                }
            }
        }

        stage('Checkout') {
            steps {
                // Checkout the source code from the repository
                git url: 'https://github.com/ozcu/app-aggregator.git', branch: 'master'
            }
        }
/*
        stage('Scan Vulnerabilities') {
            steps {
                sh 'docker run -v ${WORKSPACE}:${WORKSPACE} --workdir ${WORKSPACE} returntocorp/semgrep-agent:v1 semgrep-agent --config p/ci --config p/security-audit --config p/secrets'
            }
        }
*/
        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image using the Dockerfile
                    sh 'docker build -t node-price-scraper .'
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Stop any running container with the same name
                    sh 'docker stop $DOCKER_IMAGE || true'
                    // Remove any stopped container with the same name
                    sh 'docker rm $DOCKER_IMAGE || true'
                    // Run the Docker container
                    sh 'docker run -d --name $DOCKER_IMAGE -p 3000:3000 $DOCKER_IMAGE'
                }
            }
        }
    }

    post {
        always {
            // Archive log files from the Docker container if any
            script {
                sh 'docker logs $DOCKER_IMAGE > container.log || true'
                archiveArtifacts artifacts: 'container.log', allowEmptyArchive: true
            }
        }

        success {
            slackSend (
                channel: '#test-jenkins',
                color: 'good',
                message: "Build #${env.BUILD_NUMBER} succeeded in ${env.JOB_NAME}. Check Jenkins for more details: ${env.BUILD_URL}"
            )
            echo 'Build succeeded and Slack notification sent!'

            // Wait for 30 minutes before stopping the VM
            script {
                echo 'Waiting for 30 minutes before stopping the GCP VM...'
                sleep 1800 // Wait for 30 minutes
                sh "gcloud compute instances stop ${GCP_VM_NAME} --zone=${GCP_ZONE} --project=${GCP_PROJECT}"
            }
        }

        failure {
            slackSend (
                channel: '#test-jenkins',
                color: 'danger',
                message: "Build #${env.BUILD_NUMBER} failed in ${env.JOB_NAME}. Check Jenkins for more details: ${env.BUILD_URL}"
            )
            echo 'Build failed and Slack notification sent!'

            // Wait for 30 minutes before stopping the VM even in case of failure
            script {
                echo 'Waiting for 30 minutes before stopping the GCP VM after failure...'
                sleep 1800 // Wait for 30 minutes
                sh "gcloud compute instances stop ${GCP_VM_NAME} --zone=${GCP_ZONE} --project=${GCP_PROJECT}"
            }
        }
    }
}
