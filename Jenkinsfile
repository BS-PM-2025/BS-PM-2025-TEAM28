pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'echo Hello from the Build stage!'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'echo All tests passed!'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying the app...'
                sh 'echo Deployment successful!'
            }
        }
    }
}
