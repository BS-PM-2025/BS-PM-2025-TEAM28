pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'node --check sources/add2vals.js'
                sh 'node --check sources/calc.js'
            }
        }

        stage('Test') {
            steps {
                sh 'npm install'
                sh 'npx jest --ci --reporters=default --reporters=jest-junit'
            }
            post {
                always {
                    junit 'junit.xml'
                }
            }
        }
    }
}
