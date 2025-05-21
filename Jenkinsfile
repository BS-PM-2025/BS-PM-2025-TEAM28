pipeline {
    agent any

    environment {
        NODE_IMAGE = 'node:18-alpine'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Setup Node.js (host)') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Run Tests (Docker + JUnit)') {
            steps {
                bat "docker pull %NODE_IMAGE%"

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
            post {
                always {
                    junit testResults: '*.xml', allowEmptyResults: true
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

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t fitmap-app --no-cache -f Dockerfile .'
            }
        }

        stage('Run Docker Container') {
            steps {
                bat 'docker-compose up -d'
                bat 'powershell -Command "Start-Sleep -Seconds 10"'
                bat 'docker-compose ps'
            }
        }
    }

    post {
        always {
            bat 'docker-compose down'
            cleanWs()
        }
        success { echo '✅  Pipeline completed successfully!' }
        failure {
            echo '❌  Pipeline failed, dumping logs:'
            bat 'docker-compose logs'
        }
    }
}
