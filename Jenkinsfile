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
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests (Docker + JUnit)') {
            steps {
                sh "docker pull ${env.NODE_IMAGE}"

                sh '''
                docker run --rm \
                  -e CI=true \
                  -e JEST_JUNIT_OUTPUT=/app/junit.xml \
                  -v "$PWD":/app \
                  -w /app \
                  node:18-alpine \
                  sh -c "npm run test:ci"
                '''
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
                sh 'docker build -t fitmap-app --no-cache -f Dockerfile .'
            }
        }

        stage('Run Docker Container') {
            steps {
                sh 'docker-compose up -d'
                sh 'sleep 10'
                sh 'docker-compose ps'
            }
        }
    }

    post {
        always {
            sh 'docker-compose down || true'
            cleanWs()
        }
        success { echo '✅  Pipeline completed successfully!' }
        failure {
            echo '❌  Pipeline failed, dumping logs:'
            sh 'docker-compose logs || true'
        }
    }
}
