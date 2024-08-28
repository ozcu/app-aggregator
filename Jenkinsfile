pipeline {
    agent any

    environment {
        NODE_ENV = 'production' // Set the environment variable for Node.js
        DOCKER_IMAGE = 'node-price-scraper' // Name of the Docker image to build
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the source code from the repository
                git url: 'https://github.com/ozcu/app-aggregator.git', branch: 'master'
            }
        }

        stage('Scan Vulnerabilities'){
            steps{
                sh "docker run -v ${WORKSPACE}:/src --workdir /src returntocorp/semgrep-agent:v1 semgrep-agent --config  p/ci --config p/security-audit --config p/secrets"
            }
        }

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
        }

        failure {
            slackSend (
                channel: '#test-jenkins',
                color: 'danger',
                message: "Build #${env.BUILD_NUMBER} failed in ${env.JOB_NAME}. Check Jenkins for more details: ${env.BUILD_URL}"
            )
            echo 'Build failed and Slack notification sent!'
        }
    }
}
