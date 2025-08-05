pipeline {
    agent any

    environment {
        DOCKER_USER = 'kanishkatharuka'
        FRONTEND_IMAGE = "${DOCKER_USER}/inventory-supply-chain-frontend:latest"
        BACKEND_IMAGE = "${DOCKER_USER}/inventory-supply-chain-backend:latest"
    }

    stages {
        stage('Checkout Code') {
            steps {
                retry(3){
                    echo 'Cloning the project...'
                    git url: 'https://github.com/KanishkaTharuka/Inventory-Supply-Chain-Management-System.git', branch: 'main'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Installing and building frontend...'
                dir('client') {
                    bat 'npm install'
                    bat 'npm start'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Installing backend dependencies...'
                dir('server') {
                    bat 'npm install'
                }
            }
        }

        stage('Docker Build & Push Frontend') {
            steps {
                echo 'Building and pushing frontend Docker image...'
                withCredentials([string(credentialsId: 'dockerhubpassword', variable: 'dockerpass')]) {
                    bat "docker login -u %USERNAME% -p %dockerpass%"
                    bat "docker build -t %FRONTEND_IMAGE% client"
                    bat "docker push %FRONTEND_IMAGE%"
                }
            }
        }

        stage('Docker Build & Push Backend') {
            steps {
                echo 'Building and pushing backend Docker image...'
                withCredentials([string(credentialsId: 'dockerhubpassword', variable: 'dockerpass')]) {
                    bat "docker build -t %BACKEND_IMAGE% server"
                    bat "docker push %BACKEND_IMAGE%"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application using Docker Compose...'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker login session...'
            bat 'docker logout'
        }
        failure {
            echo 'Build or deploy failed!'
        }
    }
}
