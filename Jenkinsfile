pipeline {
    agent {
        docker {
            image 'node:16-alpine'
        }
    }
    stages {
        stage('Install Dependencies') {            
            steps {
                dir('storage-app') {
                    sh 'ls'
                    sh 'npm install'
                }
            }
        }
        stage('Run Tests') {
             steps {
                dir('storage-app') {
                    sh 'ls'
                    sh 'npm test -- --coverage'
                }
            }
        }
        stage('Build and Deploy') {
            steps {
                  dir('storage-app') {
                    sh 'ls'
                    sh 'CI=false npm run build'
                }
            }
        }
    }
}
