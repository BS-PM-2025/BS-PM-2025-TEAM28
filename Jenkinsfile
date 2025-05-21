/* Jenkinsfile – FitMap */

pipeline {
    agent any

    environment {
        NODE_IMAGE = 'node:18-alpine'   // official Docker Hub image
    }

    stages {
        /* ---------- Source ---------- */
        stage('Checkout') {
            steps { checkout scm }
        }

        /* ---------- Tooling ---------- */
        stage('Setup Node.js (host)') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        /* ---------- Dependencies ---------- */
        stage('Install Dependencies') {
            steps {
                dir('fitmap') { bat 'npm ci' }
            }
        }

        /* ---------- Tests & Quality Gate ---------- */
       stage('Run Tests (Docker + JUnit)') {
    steps {
        dir('fitmap') {
            /* pull image if missing */
            bat "docker pull %NODE_IMAGE%"

            /* run Jest tests inside the container */
            bat """
            docker run --rm ^
              -e CI=true ^
              -e JEST_JUNIT_OUTPUT=/app/junit.xml ^
              -v "%cd%":/app ^
              -w /app ^
              %NODE_IMAGE% ^
              sh -c "npm run test:ci"
            """
        }
    }
    post {
        always {
            junit testResults: 'fitmap/*.xml', allowEmptyResults: true
        }
        success {
            script {
                def tr = currentBuild.testResultAction
                if (!tr) { error '❌  No test results found.' }

                def total  = tr.totalCount ?: 0
                def passed = tr.passCount  ?: 0
                def ratio  = total ? passed / total : 0
                echo "🧪  Pass-rate = ${(ratio*100).round(2)} %"

                if (ratio < 0.90) {
                    error "❌  Pass-rate below 90 % – failing the build."
                }
            }
        }
    }
}


        /* ---------- Build ---------- */
        stage('Build Docker Image') {
            steps {
                dir('fitmap') {
                    bat 'docker build -t fitmap-app --no-cache -f ../Dockerfile .'
                }
            }
        }

        /* ---------- Run ---------- */
        stage('Run Docker Container') {
            steps {
                dir('fitmap') {
                    bat 'docker-compose -f ../docker-compose.yml up -d'
                    bat 'powershell -Command "Start-Sleep -Seconds 10"'
                    bat 'docker-compose -f ../docker-compose.yml ps'
                }
            }
        }
    }

    /* ---------- Cleanup & Notifications ---------- */
    post {
        always {
            dir('fitmap') { bat 'docker-compose -f ../docker-compose.yml down' }
            cleanWs()
        }
        success { echo '✅  Pipeline completed successfully!' }
        failure {
            echo '❌  Pipeline failed, dumping logs:'
            dir('fitmap') { bat 'docker-compose -f ../docker-compose.yml logs' }
        }
    }
}