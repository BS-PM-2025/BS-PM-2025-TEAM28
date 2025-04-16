pipeline {
    agent none

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
               
                sh 'node --check sources/add2vals.js'
                sh 'node --check sources/calc.js'
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
               
                sh 'npm install'

               
                sh 'npx jest --ci --reporters=default --reporters=jest-junit'
            }
            post {
                always {
                    junit 'junit.xml' // this is the default output file for jest-junit
                }
            }
        }
    }
}
