pipeline {
    agent any

    environment {
        DOCKER_USER = 'monodakay'
        ORDER_IMG = 'monodakay/polyglot-order-service:latest'
        ANALYTICS_IMG = 'monodakay/polyglot-analytics-service:latest'
        FRONTEND_IMG = 'monodakay/polyglot-frontend:latest'
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/akaykashyap2019/monod-polyglot-cloud.git'
            }
        }

        stage('Parallel Docker Builds') {
            parallel {
                stage('Build Node Order Service') {
                    steps {
                        sh "docker build -t ${ORDER_IMG} ./order-service"
                    }
                }
                stage('Build Python Analytics Service') {
                    steps {
                        sh "docker build -t ${ANALYTICS_IMG} ./analytics-service"
                    }
                }
                stage('Build Nginx Frontend') {
                    steps {
                        sh "docker build -t ${FRONTEND_IMG} ./frontend"
                    }
                }
            }
        }

        stage('Parallel Security Vulnerability Scan') {
            parallel {
                stage('Trivy Scan - Node App') {
                    steps {
                        sh "trivy image --severity HIGH,CRITICAL ${ORDER_IMG}"
                    }
                }
                stage('Trivy Scan - Python App') {
                    steps {
                        sh "trivy image --severity HIGH,CRITICAL ${ANALYTICS_IMG}"
                    }
                }
                stage('Trivy Scan - Nginx Frontend') {
                    steps {
                        sh "trivy image --severity HIGH,CRITICAL ${FRONTEND_IMG}"
                    }
                }
            }
        }

        stage('Docker Hub Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'Docker') {
                        sh """
                            docker push ${ORDER_IMG}
                            docker push ${ANALYTICS_IMG}
                            docker push ${FRONTEND_IMG}
                        """
                    }
                }
            }
        }

        stage('Deploy Mesh') {
            steps {
                sh '''
                    docker compose down || true
                    docker compose pull
                    docker compose up -d
                '''
            }
        }
    }
}
