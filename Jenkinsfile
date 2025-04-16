pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    def pythonImage = docker.image('python:2-alpine')
                    pythonImage.pull()
                    pythonImage.inside {
                        sh 'python -m py_compile sources/add2vals.py sources/calc.py'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    def pytestImage = docker.image('qnib/pytest')
                    pytestImage.pull()
                    pytestImage.inside {
                        sh 'py.test --verbose --junit-xml=test-reports/results.xml sources/test_calc.py'
                    }
                }
            }
            post {
                always {
                    junit 'test-reports/results.xml'
                }
            }
        }
    }
}
