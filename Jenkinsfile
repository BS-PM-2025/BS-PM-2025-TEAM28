pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install, Test & Build') {
      steps {
        dir('storage-app') {
          script {
            def nodeImg = 'node:18-alpine'
            docker.image(nodeImg).inside {
              sh 'npm ci'
              sh 'npm test -- --coverage'
              sh 'CI=false npm run build'
            }
          }
        }
      }
    }
  }
}
