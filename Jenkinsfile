pipeline {
  agent any
  stages {
    stage('Test') {
      steps {
        script {
          sh 'npm test -- --watch=false --browsers=ChromeHeadless'
        }
      }
    }
  }
}