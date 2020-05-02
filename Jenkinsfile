pipeline {
    agent {
        docker {
            image 'node:14-alpine' 
        }
    }
    stages {
        stage('Install') { 
            steps {
                sh 'npm install' 
            }
        },
        stage('Code-Style') { 
            steps {
                sh 'npm run lint' 
            }
        }
    }
}
