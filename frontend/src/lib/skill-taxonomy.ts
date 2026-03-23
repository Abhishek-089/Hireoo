/**
 * Skill Taxonomy — maps job roles and titles to related technologies/skills.
 * Used for query expansion so searching "frontend developer" also surfaces
 * React, Vue.js, Angular, HTML, CSS, TypeScript jobs automatically.
 */

export const ROLE_SKILL_MAP: Record<string, string[]> = {

  // ── Frontend ──────────────────────────────────────────────────────────────
  "frontend": [
    "react", "vue", "angular", "html", "css", "javascript", "typescript",
    "next.js", "nuxt", "svelte", "tailwind", "webpack", "vite", "sass", "less",
  ],
  "frontend developer": [
    "react", "vue", "vue.js", "angular", "html", "css", "javascript", "typescript",
    "next.js", "nextjs", "nuxt", "svelte", "sveltekit", "tailwind", "webpack",
    "vite", "sass", "less", "ui developer", "web developer", "frontend engineer",
  ],
  "frontend engineer": [
    "react", "vue", "angular", "html", "css", "javascript", "typescript",
    "next.js", "vite", "tailwind",
  ],
  "ui developer": [
    "html", "css", "javascript", "react", "vue", "angular", "figma", "tailwind",
    "sass", "bootstrap", "frontend",
  ],
  "web developer": [
    "html", "css", "javascript", "react", "node.js", "php", "wordpress",
    "vue", "angular", "tailwind",
  ],
  "web designer developer": [
    "html", "css", "javascript", "figma", "react", "vue", "tailwind", "webflow",
    "wordpress", "ui/ux", "frontend",
  ],
  "react developer": [
    "react", "react.js", "javascript", "typescript", "next.js", "redux",
    "react query", "hooks", "vite", "tailwind", "frontend",
  ],
  "react engineer": [
    "react", "react.js", "javascript", "typescript", "next.js", "frontend",
  ],
  "next.js developer": [
    "next.js", "nextjs", "react", "javascript", "typescript", "vercel",
    "server-side rendering", "ssr", "frontend",
  ],
  "vue developer": [
    "vue", "vue.js", "nuxt", "javascript", "typescript", "vuex", "pinia", "frontend",
  ],
  "nuxt.js developer": [
    "nuxt", "nuxt.js", "vue", "vue.js", "javascript", "typescript", "ssr", "frontend",
  ],
  "angular developer": [
    "angular", "typescript", "javascript", "rxjs", "ngrx", "angular cli", "frontend",
  ],
  "svelte developer": [
    "svelte", "sveltekit", "javascript", "typescript", "frontend",
  ],
  "remix developer": [
    "remix", "react", "javascript", "typescript", "next.js", "ssr", "frontend",
  ],
  "astro developer": [
    "astro", "javascript", "typescript", "react", "vue", "svelte", "static site", "frontend",
  ],
  "javascript developer": [
    "javascript", "typescript", "react", "node.js", "vue", "angular", "html", "css",
    "es6", "frontend", "backend", "full stack",
  ],
  "typescript developer": [
    "typescript", "javascript", "react", "node.js", "next.js", "nestjs", "angular",
    "frontend", "backend",
  ],
  "html css developer": [
    "html", "css", "javascript", "sass", "tailwind", "bootstrap", "responsive design",
    "frontend",
  ],

  // ── Backend ───────────────────────────────────────────────────────────────
  "backend": [
    "node.js", "python", "java", "go", "golang", "rust", "php", "ruby",
    "django", "fastapi", "flask", "spring", "express", "nestjs", "laravel",
    "api", "rest", "graphql", "postgresql", "mysql", "mongodb",
  ],
  "backend developer": [
    "node.js", "python", "java", "go", "golang", "rust", "php", "ruby",
    "django", "fastapi", "spring", "express", "nestjs", "backend engineer",
    "api developer", "rest api", "graphql", "postgresql", "mysql",
  ],
  "backend engineer": [
    "node.js", "python", "java", "go", "golang", "django", "fastapi",
    "spring", "express", "nestjs", "rest", "graphql",
  ],
  "node.js developer": [
    "node.js", "nodejs", "express", "nestjs", "javascript", "typescript",
    "mongodb", "postgresql", "backend",
  ],
  "nodejs developer": [
    "node.js", "nodejs", "express", "nestjs", "javascript", "typescript",
    "mongodb", "postgresql", "backend",
  ],
  "node developer": ["node.js", "express", "nestjs", "javascript", "typescript", "backend"],
  "expressjs developer": [
    "express", "express.js", "node.js", "javascript", "typescript", "rest api",
    "mongodb", "postgresql", "backend",
  ],
  "nestjs developer": [
    "nestjs", "nest.js", "node.js", "typescript", "express", "rest api",
    "graphql", "postgresql", "mongodb", "backend",
  ],
  "fastify developer": [
    "fastify", "node.js", "javascript", "typescript", "rest api", "backend",
  ],
  "api developer": [
    "rest api", "graphql", "node.js", "python", "java", "go", "postgresql",
    "mongodb", "swagger", "postman", "backend",
  ],
  "graphql developer": [
    "graphql", "apollo", "node.js", "python", "typescript", "rest api", "backend",
  ],
  "rest api developer": [
    "rest api", "node.js", "python", "java", "go", "express", "fastapi",
    "spring", "postgresql", "swagger", "backend",
  ],
  "python developer": [
    "python", "django", "fastapi", "flask", "pandas", "numpy", "sqlalchemy",
    "celery", "postgresql", "backend",
  ],
  "python engineer": [
    "python", "django", "fastapi", "flask", "pandas", "sqlalchemy", "backend",
  ],
  "django developer": [
    "django", "python", "rest framework", "postgresql", "celery", "redis", "backend",
  ],
  "flask developer": [
    "flask", "python", "rest api", "postgresql", "mongodb", "backend",
  ],
  "fastapi developer": [
    "fastapi", "python", "async", "pydantic", "postgresql", "sqlalchemy", "backend",
  ],
  "python backend developer": [
    "python", "django", "fastapi", "flask", "postgresql", "redis", "celery", "backend",
  ],
  "python automation engineer": [
    "python", "selenium", "playwright", "automation", "scripting", "pytest",
    "pandas", "ci/cd",
  ],
  "java developer": [
    "java", "spring", "spring boot", "hibernate", "maven", "gradle",
    "microservices", "backend",
  ],
  "java engineer": [
    "java", "spring boot", "hibernate", "maven", "microservices", "jpa", "backend",
  ],
  "java backend developer": [
    "java", "spring boot", "hibernate", "rest api", "microservices", "postgresql", "backend",
  ],
  "spring boot developer": [
    "spring boot", "java", "spring", "hibernate", "jpa", "maven", "rest api",
    "microservices", "backend",
  ],
  "java microservices developer": [
    "java", "spring boot", "microservices", "docker", "kubernetes", "kafka",
    "rest api", "backend",
  ],
  "j2ee developer": [
    "java", "j2ee", "spring", "hibernate", "servlets", "jsp", "ejb", "backend",
  ],
  "hibernate developer": [
    "hibernate", "java", "jpa", "spring", "postgresql", "mysql", "orm", "backend",
  ],
  "go developer": ["golang", "go", "grpc", "microservices", "kubernetes", "backend"],
  "golang developer": ["golang", "go", "grpc", "microservices", "backend"],
  "go engineer": ["golang", "go", "grpc", "microservices", "docker", "backend"],
  "php developer": ["php", "laravel", "symfony", "wordpress", "mysql", "composer"],
  "laravel developer": [
    "laravel", "php", "mysql", "rest api", "composer", "eloquent", "blade", "backend",
  ],
  "symfony developer": [
    "symfony", "php", "doctrine", "mysql", "rest api", "composer", "backend",
  ],
  "codeigniter developer": [
    "codeigniter", "php", "mysql", "rest api", "backend",
  ],
  "wordpress developer": [
    "wordpress", "php", "mysql", "woocommerce", "elementor", "plugins",
    "themes", "cms",
  ],
  "magento developer": [
    "magento", "php", "mysql", "ecommerce", "cms", "backend",
  ],
  "ruby developer": ["ruby", "rails", "ruby on rails", "postgresql", "rspec", "backend"],
  "ruby on rails developer": [
    "ruby", "rails", "ruby on rails", "postgresql", "rspec", "sidekiq",
    "activerecord", "backend",
  ],
  "rails developer": [
    "rails", "ruby", "postgresql", "activerecord", "rspec", "backend",
  ],
  "rust developer": ["rust", "tokio", "actix", "backend", "systems programming"],
  "rust engineer": ["rust", "tokio", "actix", "webassembly", "systems programming"],
  "c++ developer": ["c++", "cpp", "embedded", "systems programming", "game development"],
  "cpp developer": ["c++", "cpp", "stl", "cmake", "embedded", "systems programming"],
  "c developer": ["c", "c++", "embedded", "linux", "systems programming", "rtos"],
  "c++ engineer": ["c++", "cpp", "stl", "cmake", "systems programming"],
  "embedded c developer": [
    "c", "embedded c", "rtos", "microcontroller", "arm", "linux", "firmware",
  ],
  "c# developer": [".net", "c#", "asp.net", "entity framework", "azure", "backend"],
  "dotnet developer": [".net", "c#", "asp.net", "entity framework", "azure", "backend"],
  "asp.net developer": [
    "asp.net", "c#", ".net", "entity framework", "azure", "rest api", "mvc", "backend",
  ],
  "dotnet core developer": [
    ".net core", "c#", "asp.net core", "entity framework", "azure", "rest api", "backend",
  ],
  "dotnet solution architect": [
    ".net", "c#", "azure", "microservices", "asp.net", "system design", "architecture",
  ],
  ".net solution architect": [
    ".net", "c#", "azure", "microservices", "asp.net", "system design", "architecture",
  ],
  "blazor developer": [
    "blazor", "c#", ".net", "webassembly", "asp.net", "frontend", "backend",
  ],
  "scala developer": [
    "scala", "akka", "spark", "functional programming", "jvm", "kafka", "backend",
  ],
  "kotlin developer": [
    "kotlin", "android", "jetpack compose", "spring boot", "coroutines", "mobile",
  ],
  "kotlin android developer": [
    "kotlin", "android", "jetpack compose", "android studio", "coroutines",
    "retrofit", "mobile",
  ],

  // ── Full Stack ────────────────────────────────────────────────────────────
  "full stack": [
    "react", "node.js", "python", "javascript", "typescript", "mongodb",
    "postgresql", "mysql", "frontend", "backend", "full-stack", "fullstack",
  ],
  "full stack developer": [
    "react", "node.js", "python", "javascript", "typescript", "mongodb",
    "postgresql", "mysql", "frontend", "backend", "fullstack", "full-stack developer",
  ],
  "full stack engineer": [
    "react", "node.js", "javascript", "typescript", "full-stack", "database", "api",
  ],
  "fullstack developer": [
    "react", "node.js", "python", "javascript", "typescript", "mongodb", "postgresql",
  ],
  "mern developer": [
    "mongodb", "express", "react", "node.js", "javascript", "full stack", "mern",
  ],
  "mean developer": [
    "mongodb", "express", "angular", "node.js", "javascript", "full stack", "mean",
  ],
  "lamp stack developer": [
    "linux", "apache", "mysql", "php", "wordpress", "laravel", "backend",
  ],
  "t3 stack developer": [
    "typescript", "next.js", "trpc", "tailwind", "prisma", "nextauth", "full stack",
  ],
  "pern stack developer": [
    "postgresql", "express", "react", "node.js", "javascript", "typescript", "full stack",
  ],

  // ── Mobile ────────────────────────────────────────────────────────────────
  "mobile developer": [
    "react native", "flutter", "swift", "kotlin", "android", "ios", "mobile app",
    "dart", "swiftui", "jetpack compose",
  ],
  "mobile engineer": [
    "react native", "flutter", "swift", "kotlin", "android", "ios",
  ],
  "mobile app developer": [
    "react native", "flutter", "swift", "kotlin", "android", "ios", "dart",
    "expo", "mobile",
  ],
  "ios developer": [
    "swift", "objective-c", "xcode", "ios", "apple", "swiftui", "core data",
    "combine", "uikit",
  ],
  "ios engineer": ["swift", "objective-c", "xcode", "ios", "swiftui"],
  "swift developer": [
    "swift", "swiftui", "uikit", "xcode", "ios", "combine", "core data", "mobile",
  ],
  "swiftui developer": [
    "swiftui", "swift", "ios", "xcode", "combine", "core data", "mobile",
  ],
  "objective-c developer": [
    "objective-c", "swift", "ios", "xcode", "uikit", "core data", "mobile",
  ],
  "android developer": [
    "kotlin", "java", "android studio", "android", "jetpack compose",
    "coroutines", "retrofit",
  ],
  "android engineer": ["kotlin", "java", "android", "jetpack compose"],
  "react native developer": [
    "react native", "javascript", "typescript", "mobile", "ios", "android", "expo",
  ],
  "flutter developer": ["flutter", "dart", "ios", "android", "mobile"],
  "xamarin developer": [
    "xamarin", "c#", ".net", "ios", "android", "mobile", "cross-platform",
  ],
  "ionic developer": [
    "ionic", "angular", "react", "javascript", "typescript", "mobile", "hybrid app",
  ],

  // ── Data Engineering / ETL ─────────────────────────────────────────────────
  "data engineer": [
    "python", "spark", "hadoop", "kafka", "airflow", "sql", "bigquery",
    "data pipeline", "etl", "dbt", "snowflake", "databricks",
  ],
  "etl developer": [
    "etl", "talend", "informatica", "python", "sql", "spark", "data warehouse",
    "bigquery", "snowflake", "data pipeline",
  ],
  "data pipeline engineer": [
    "python", "airflow", "spark", "kafka", "dbt", "bigquery", "snowflake",
    "data pipeline", "etl",
  ],
  "spark developer": [
    "spark", "python", "scala", "hadoop", "bigquery", "databricks",
    "data engineering",
  ],
  "hadoop developer": [
    "hadoop", "hdfs", "hive", "spark", "mapreduce", "yarn", "data engineering",
  ],
  "kafka engineer": [
    "kafka", "apache kafka", "python", "java", "scala", "streaming", "event-driven",
    "data engineering",
  ],
  "airflow engineer": [
    "airflow", "apache airflow", "python", "data pipeline", "etl", "data engineering",
  ],
  "dbt developer": [
    "dbt", "sql", "bigquery", "snowflake", "redshift", "data transformation",
    "data warehouse", "analytics engineering",
  ],
  "snowflake developer": [
    "snowflake", "sql", "dbt", "python", "data warehouse", "data engineering",
  ],
  "databricks engineer": [
    "databricks", "spark", "python", "delta lake", "mlflow", "data engineering",
  ],
  "bigquery developer": [
    "bigquery", "sql", "gcp", "google cloud", "data warehouse", "data engineering",
  ],
  "redshift developer": [
    "redshift", "aws", "sql", "data warehouse", "python", "data engineering",
  ],

  // ── Data Analytics / BI ────────────────────────────────────────────────────
  "data scientist": [
    "python", "machine learning", "ml", "pandas", "numpy", "scikit-learn",
    "tensorflow", "pytorch", "statistics", "sql", "jupyter", "r",
  ],
  "data analyst": [
    "python", "sql", "tableau", "power bi", "excel", "analytics",
    "data visualization", "r", "looker",
  ],
  "business analyst": [
    "sql", "excel", "power bi", "tableau", "requirements gathering",
    "jira", "agile", "data analysis", "stakeholder management",
  ],
  "bi developer": [
    "tableau", "power bi", "sql", "data warehouse", "business intelligence",
    "looker", "dbt",
  ],
  "tableau developer": [
    "tableau", "sql", "data visualization", "business intelligence",
    "analytics", "bi developer",
  ],
  "power bi developer": [
    "power bi", "dax", "sql", "power query", "data visualization",
    "business intelligence", "azure",
  ],
  "looker developer": [
    "looker", "lookml", "sql", "data visualization", "business intelligence",
  ],
  "sql analyst": [
    "sql", "postgresql", "mysql", "excel", "power bi", "tableau",
    "data analysis", "business intelligence",
  ],
  "analytics engineer": [
    "dbt", "sql", "bigquery", "snowflake", "python", "data modeling",
    "data warehouse", "analytics",
  ],
  "reporting analyst": [
    "sql", "excel", "power bi", "tableau", "reporting", "data analysis",
  ],

  // ── AI / ML / Deep Learning ────────────────────────────────────────────────
  "machine learning engineer": [
    "python", "tensorflow", "pytorch", "machine learning", "deep learning",
    "neural networks", "ml", "scikit-learn", "mlops", "kubeflow",
  ],
  "ml engineer": [
    "python", "tensorflow", "pytorch", "machine learning", "scikit-learn", "mlops",
  ],
  "ai engineer": [
    "python", "tensorflow", "pytorch", "openai", "llm", "machine learning",
    "deep learning", "nlp", "langchain", "vector database",
  ],
  "llm engineer": [
    "python", "openai", "llm", "langchain", "rag", "vector database",
    "prompt engineering", "fine-tuning",
  ],
  "deep learning engineer": [
    "python", "pytorch", "tensorflow", "deep learning", "neural networks",
    "gpu", "cuda", "machine learning",
  ],
  "nlp engineer": [
    "python", "nlp", "natural language processing", "transformers", "bert",
    "spacy", "hugging face", "machine learning",
  ],
  "computer vision engineer": [
    "python", "opencv", "pytorch", "tensorflow", "yolo", "deep learning",
    "image processing", "machine learning",
  ],
  "generative ai engineer": [
    "python", "openai", "llm", "langchain", "stable diffusion", "rag",
    "vector database", "prompt engineering", "generative ai",
  ],
  "gen ai developer": [
    "python", "openai", "llm", "langchain", "rag", "generative ai", "prompt engineering",
  ],
  "prompt engineer": [
    "openai", "llm", "prompt engineering", "python", "langchain", "gpt", "generative ai",
  ],
  "rag developer": [
    "rag", "langchain", "vector database", "openai", "python", "llm",
    "retrieval augmented generation",
  ],
  "langchain developer": [
    "langchain", "python", "openai", "llm", "rag", "vector database",
    "agents", "generative ai",
  ],
  "openai developer": [
    "openai", "gpt", "python", "langchain", "llm", "prompt engineering",
    "api integration", "generative ai",
  ],
  "mlops engineer": [
    "mlops", "python", "mlflow", "kubeflow", "docker", "kubernetes",
    "ci/cd", "machine learning", "aws sagemaker",
  ],
  "ai researcher": [
    "python", "pytorch", "tensorflow", "research", "deep learning",
    "machine learning", "publications", "nlp", "computer vision",
  ],
  "ai scientist": [
    "python", "pytorch", "tensorflow", "deep learning", "statistics",
    "machine learning", "research",
  ],
  "reinforcement learning engineer": [
    "python", "reinforcement learning", "pytorch", "gym", "deep learning",
    "machine learning",
  ],

  // ── DevOps / Cloud / Infrastructure ────────────────────────────────────────
  "devops": [
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd",
    "jenkins", "linux", "bash", "ansible", "helm",
  ],
  "devops engineer": [
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd",
    "jenkins", "linux", "ansible", "github actions", "gitlab ci",
  ],
  "cloud engineer": [
    "aws", "azure", "gcp", "terraform", "kubernetes", "docker",
    "cloud infrastructure", "serverless",
  ],
  "cloud architect": [
    "aws", "azure", "gcp", "terraform", "kubernetes", "microservices", "cloud",
    "solution architect",
  ],
  "cloud developer": [
    "aws", "azure", "gcp", "serverless", "lambda", "terraform", "docker", "kubernetes",
  ],
  "aws engineer": [
    "aws", "ec2", "s3", "lambda", "rds", "ecs", "eks", "cloudformation",
    "terraform", "devops",
  ],
  "azure engineer": [
    "azure", "azure devops", "terraform", "kubernetes", "aks", "bicep",
    "powershell", "devops",
  ],
  "gcp engineer": [
    "gcp", "google cloud", "bigquery", "gke", "cloud run", "terraform",
    "kubernetes", "devops",
  ],
  "sre": [
    "kubernetes", "docker", "terraform", "monitoring", "aws", "reliability",
    "prometheus", "grafana", "pagerduty",
  ],
  "site reliability engineer": [
    "kubernetes", "docker", "terraform", "monitoring", "aws", "sre",
    "prometheus", "grafana",
  ],
  "sre engineer": [
    "kubernetes", "docker", "terraform", "monitoring", "aws", "sre",
    "prometheus", "grafana", "linux",
  ],
  "platform engineer": [
    "kubernetes", "docker", "terraform", "aws", "azure", "gcp", "platform",
    "developer experience",
  ],
  "infrastructure engineer": [
    "terraform", "kubernetes", "docker", "aws", "linux", "networking", "ansible",
  ],
  "devops architect": [
    "kubernetes", "aws", "terraform", "ci/cd", "architecture", "devops",
    "docker", "microservices",
  ],
  "terraform engineer": [
    "terraform", "aws", "azure", "gcp", "infrastructure as code", "devops",
    "kubernetes",
  ],
  "ansible engineer": [
    "ansible", "linux", "bash", "python", "devops", "automation",
    "terraform", "configuration management",
  ],
  "jenkins engineer": [
    "jenkins", "ci/cd", "groovy", "docker", "devops", "pipeline",
    "github actions",
  ],
  "ci cd engineer": [
    "ci/cd", "github actions", "gitlab ci", "jenkins", "docker",
    "kubernetes", "devops",
  ],
  "docker engineer": [
    "docker", "kubernetes", "container", "devops", "aws", "ci/cd",
    "docker compose",
  ],
  "kubernetes engineer": [
    "kubernetes", "k8s", "docker", "helm", "terraform", "aws", "devops",
  ],
  "linux administrator": [
    "linux", "bash", "shell scripting", "ubuntu", "centos", "networking",
    "system administration",
  ],
  "system administrator": [
    "linux", "windows server", "bash", "networking", "active directory",
    "vmware", "system administration",
  ],
  "network engineer": [
    "networking", "cisco", "routing", "switching", "tcp/ip", "firewall",
    "vpn", "linux",
  ],
  "serverless developer": [
    "serverless", "aws lambda", "azure functions", "gcp cloud functions",
    "node.js", "python", "terraform",
  ],
  "aws lambda developer": [
    "aws lambda", "serverless", "python", "node.js", "aws", "api gateway",
    "terraform",
  ],
  "microservices developer": [
    "microservices", "docker", "kubernetes", "node.js", "java", "python",
    "rest api", "kafka", "backend",
  ],
  "microservices architect": [
    "microservices", "docker", "kubernetes", "architecture", "kafka",
    "api gateway", "system design",
  ],

  // ── Monitoring / Observability ─────────────────────────────────────────────
  "observability engineer": [
    "prometheus", "grafana", "datadog", "new relic", "elasticsearch",
    "kibana", "devops", "monitoring",
  ],
  "monitoring engineer": [
    "prometheus", "grafana", "datadog", "nagios", "zabbix", "devops", "monitoring",
  ],
  "prometheus engineer": [
    "prometheus", "grafana", "alertmanager", "kubernetes", "devops", "monitoring",
  ],
  "grafana developer": [
    "grafana", "prometheus", "elasticsearch", "influxdb", "devops", "monitoring",
  ],
  "datadog engineer": [
    "datadog", "apm", "logging", "monitoring", "devops", "python", "aws",
  ],

  // ── Database / SQL / DBA ───────────────────────────────────────────────────
  "database administrator": [
    "postgresql", "mysql", "oracle", "mongodb", "sql", "database",
    "performance tuning", "replication",
  ],
  "dba": ["postgresql", "mysql", "oracle", "mongodb", "sql", "database"],
  "sql developer": [
    "sql", "postgresql", "mysql", "t-sql", "stored procedures", "database",
    "data warehouse",
  ],
  "mysql developer": [
    "mysql", "sql", "mariadb", "stored procedures", "database", "replication",
  ],
  "postgresql developer": [
    "postgresql", "sql", "plpgsql", "stored procedures", "database", "pgadmin",
  ],
  "mongodb developer": [
    "mongodb", "nosql", "mongoose", "aggregation", "atlas", "database",
  ],
  "nosql developer": [
    "mongodb", "dynamodb", "cassandra", "redis", "elasticsearch",
    "nosql", "database",
  ],
  "redis developer": [
    "redis", "cache", "pub/sub", "node.js", "python", "database",
  ],
  "elasticsearch developer": [
    "elasticsearch", "kibana", "logstash", "elk stack", "python", "search",
  ],
  "oracle developer": [
    "oracle", "plsql", "oracle apex", "sql", "oracle db", "database",
  ],
  "oracle dba": [
    "oracle", "plsql", "oracle db", "rman", "asm", "database administration",
  ],
  "oracle apex developer": [
    "oracle apex", "plsql", "sql", "oracle", "javascript", "database",
  ],
  "oracle fusion developer": [
    "oracle fusion", "plsql", "oracle cloud", "erp", "sql", "integration",
  ],
  "pl sql developer": [
    "pl/sql", "plsql", "oracle", "sql", "stored procedures", "triggers", "database",
  ],

  // ── Security / Cybersecurity ───────────────────────────────────────────────
  "security engineer": [
    "cybersecurity", "penetration testing", "security", "aws", "siem",
    "python", "linux", "owasp", "vulnerability",
  ],
  "cybersecurity engineer": [
    "security", "penetration testing", "ethical hacking", "network security",
    "python", "linux", "siem",
  ],
  "penetration tester": [
    "penetration testing", "ethical hacking", "kali linux", "owasp",
    "burp suite", "metasploit", "python", "networking",
  ],
  "ethical hacker": [
    "ethical hacking", "penetration testing", "kali linux", "burp suite",
    "metasploit", "owasp", "python",
  ],
  "information security analyst": [
    "siem", "soc", "threat analysis", "owasp", "network security",
    "python", "linux", "vulnerability management",
  ],
  "soc analyst": [
    "soc", "siem", "threat detection", "incident response", "splunk",
    "linux", "network security",
  ],
  "devsecops engineer": [
    "devsecops", "ci/cd", "docker", "kubernetes", "security scanning",
    "owasp", "snyk", "devops",
  ],
  "cloud security engineer": [
    "aws security", "azure security", "gcp security", "iam", "security groups",
    "cloud", "compliance", "owasp",
  ],
  "vapt engineer": [
    "vapt", "penetration testing", "vulnerability assessment", "kali linux",
    "owasp", "burp suite", "python",
  ],
  "appsec engineer": [
    "application security", "owasp", "code review", "sast", "dast",
    "burp suite", "python", "devsecops",
  ],
  "malware analyst": [
    "malware analysis", "reverse engineering", "assembly", "python",
    "ida pro", "cybersecurity", "linux",
  ],
  "security researcher": [
    "cybersecurity", "penetration testing", "cve", "exploit development",
    "python", "reverse engineering", "owasp",
  ],
  "network security engineer": [
    "network security", "firewall", "vpn", "cisco", "ids/ips",
    "networking", "linux", "cybersecurity",
  ],

  // ── QA / Testing ──────────────────────────────────────────────────────────
  "qa engineer": [
    "testing", "selenium", "cypress", "jest", "automated testing",
    "manual testing", "qa", "playwright",
  ],
  "quality assurance engineer": [
    "testing", "selenium", "cypress", "playwright", "jest", "qa",
    "test automation", "manual testing", "jira",
  ],
  "test engineer": [
    "selenium", "cypress", "jest", "testing", "automation", "qa", "playwright",
  ],
  "automation engineer": [
    "selenium", "cypress", "playwright", "python", "java", "testing", "ci/cd",
  ],
  "test automation engineer": [
    "selenium", "cypress", "playwright", "java", "python", "testng",
    "junit", "ci/cd", "qa",
  ],
  "selenium developer": [
    "selenium", "java", "python", "webdriver", "testng", "junit",
    "test automation", "qa",
  ],
  "cypress developer": [
    "cypress", "javascript", "typescript", "test automation", "e2e testing", "qa",
  ],
  "playwright developer": [
    "playwright", "javascript", "typescript", "python", "e2e testing",
    "test automation", "qa",
  ],
  "sdet": [
    "selenium", "cypress", "java", "python", "ci/cd", "test automation",
    "api testing", "qa",
  ],
  "manual tester": [
    "manual testing", "test cases", "jira", "qa", "regression testing",
    "functional testing", "bug reporting",
  ],
  "performance testing engineer": [
    "jmeter", "gatling", "k6", "load testing", "performance testing",
    "qa", "java", "python",
  ],
  "load testing engineer": [
    "jmeter", "gatling", "k6", "load testing", "performance testing", "qa",
  ],
  "appium developer": [
    "appium", "selenium", "mobile testing", "java", "python",
    "ios", "android", "test automation",
  ],

  // ── Blockchain / Web3 ──────────────────────────────────────────────────────
  "blockchain developer": [
    "solidity", "ethereum", "web3", "smart contracts", "defi", "nft",
    "hardhat", "truffle", "rust",
  ],
  "solidity developer": [
    "solidity", "ethereum", "smart contracts", "hardhat", "truffle",
    "defi", "web3", "blockchain",
  ],
  "web3 developer": [
    "web3.js", "ethers.js", "solidity", "react", "typescript",
    "blockchain", "ethereum", "defi",
  ],
  "smart contract developer": [
    "solidity", "ethereum", "web3", "smart contracts", "hardhat", "blockchain",
  ],
  "ethereum developer": [
    "ethereum", "solidity", "web3.js", "ethers.js", "smart contracts",
    "hardhat", "defi", "blockchain",
  ],
  "defi developer": [
    "defi", "solidity", "ethereum", "smart contracts", "uniswap",
    "web3", "blockchain",
  ],
  "nft developer": [
    "nft", "solidity", "ethereum", "web3", "smart contracts", "ipfs", "blockchain",
  ],
  "rust blockchain developer": [
    "rust", "solana", "substrate", "blockchain", "smart contracts", "web3",
  ],
  "substrate developer": [
    "substrate", "rust", "polkadot", "blockchain", "smart contracts", "web3",
  ],

  // ── Embedded / Firmware / Hardware ─────────────────────────────────────────
  "embedded systems engineer": [
    "c", "c++", "embedded c", "rtos", "arm", "microcontroller", "linux", "firmware",
  ],
  "firmware engineer": [
    "c", "c++", "embedded c", "rtos", "arm", "microcontroller", "firmware", "linux",
  ],
  "embedded c engineer": [
    "c", "embedded c", "rtos", "arm", "microcontroller", "stm32", "linux",
  ],
  "rtos developer": [
    "rtos", "freertos", "c", "c++", "embedded", "arm", "microcontroller",
  ],
  "fpga engineer": [
    "fpga", "vhdl", "verilog", "xilinx", "altera", "hardware design", "embedded",
  ],
  "vlsi engineer": [
    "vlsi", "vhdl", "verilog", "asic", "synthesis", "fpga", "hardware design",
  ],
  "hardware engineer": [
    "pcb design", "altium", "eagle", "embedded", "c", "fpga", "hardware", "electronics",
  ],
  "iot developer": [
    "iot", "mqtt", "c", "python", "arduino", "raspberry pi", "embedded",
    "aws iot", "azure iot",
  ],
  "arduino developer": [
    "arduino", "c", "c++", "embedded", "iot", "sensors", "microcontroller",
  ],
  "raspberry pi developer": [
    "raspberry pi", "python", "linux", "iot", "embedded", "c",
  ],
  "microcontroller developer": [
    "microcontroller", "c", "embedded c", "stm32", "arduino", "arm", "rtos",
  ],

  // ── Robotics / Automation ──────────────────────────────────────────────────
  "robotics engineer": [
    "ros", "python", "c++", "matlab", "computer vision", "robotics",
    "embedded", "control systems",
  ],
  "ros developer": [
    "ros", "ros2", "python", "c++", "robotics", "linux", "computer vision",
  ],
  "plc programmer": [
    "plc", "ladder logic", "scada", "automation", "siemens", "allen bradley",
    "industrial automation",
  ],

  // ── Game Development ──────────────────────────────────────────────────────
  "game developer": [
    "unity", "unreal engine", "c#", "c++", "game development", "godot",
    "opengl", "directx",
  ],
  "unity developer": [
    "unity", "c#", "game development", "3d", "ar", "vr", "mobile games",
    "unity3d",
  ],
  "unreal engine developer": [
    "unreal engine", "c++", "blueprints", "game development", "3d", "vr",
  ],
  "godot developer": [
    "godot", "gdscript", "c#", "game development", "2d", "3d",
  ],
  "c++ game developer": [
    "c++", "unreal engine", "opengl", "directx", "game development", "sdl",
  ],
  "game engineer": [
    "unity", "unreal engine", "c++", "c#", "game development", "graphics",
  ],

  // ── AR / VR / XR ──────────────────────────────────────────────────────────
  "ar developer": [
    "arkit", "arcore", "unity", "c#", "augmented reality", "ar", "3d",
  ],
  "vr developer": [
    "oculus sdk", "openxr", "unity", "unreal engine", "c#", "virtual reality",
    "vr", "3d",
  ],
  "xr developer": [
    "xr", "ar", "vr", "unity", "unreal engine", "c#", "openxr", "metaverse",
  ],
  "augmented reality developer": [
    "arkit", "arcore", "unity", "c#", "ar", "3d", "mobile",
  ],
  "virtual reality developer": [
    "oculus", "openxr", "unity", "unreal engine", "vr", "c#", "c++",
  ],
  "metaverse developer": [
    "unity", "unreal engine", "web3", "vr", "ar", "c#", "metaverse", "3d",
  ],

  // ── Design ────────────────────────────────────────────────────────────────
  "ui/ux designer": [
    "figma", "sketch", "adobe xd", "ui design", "ux design", "design system",
    "user research", "prototyping",
  ],
  "ux designer": [
    "figma", "sketch", "user research", "prototyping", "wireframing", "ux",
    "usability testing",
  ],
  "ui designer": [
    "figma", "sketch", "adobe xd", "html", "css", "design system", "ui",
  ],
  "product designer": [
    "figma", "sketch", "ui/ux", "design system", "user research", "prototyping",
  ],
  "graphic designer": [
    "illustrator", "photoshop", "figma", "design", "branding", "adobe creative suite",
  ],
  "visual designer": [
    "figma", "photoshop", "illustrator", "branding", "typography",
    "design system", "ui",
  ],
  "motion designer": [
    "after effects", "motion graphics", "premiere pro", "illustrator",
    "animation", "design",
  ],
  "brand designer": [
    "figma", "illustrator", "photoshop", "branding", "logo design",
    "typography", "design",
  ],
  "interaction designer": [
    "figma", "prototyping", "ux", "ui", "animation", "design system",
    "user research",
  ],
  "design system designer": [
    "figma", "design system", "component library", "ui", "tokens",
    "accessibility", "frontend",
  ],
  "figma designer": [
    "figma", "ui/ux", "prototyping", "design system", "user research", "wireframing",
  ],
  "web designer": [
    "figma", "html", "css", "ui/ux", "wordpress", "webflow", "responsive design",
  ],
  "3d designer": [
    "blender", "maya", "3ds max", "cinema 4d", "3d modeling", "rendering",
    "unreal engine",
  ],
  "3d artist": [
    "blender", "maya", "zbrush", "substance painter", "3d modeling",
    "texturing", "rendering",
  ],

  // ── Video / Animation / Creative ──────────────────────────────────────────
  "video editor": [
    "premiere pro", "after effects", "final cut pro", "davinci resolve",
    "video editing", "motion graphics",
  ],
  "motion graphics designer": [
    "after effects", "premiere pro", "illustrator", "motion graphics",
    "animation", "cinema 4d",
  ],
  "animator": [
    "after effects", "blender", "maya", "2d animation", "3d animation",
    "motion graphics",
  ],
  "2d animator": [
    "toon boom", "adobe animate", "after effects", "2d animation",
    "illustration", "storytelling",
  ],
  "3d animator": [
    "maya", "blender", "cinema 4d", "3d animation", "rigging",
    "character animation",
  ],
  "content creator": [
    "video editing", "premiere pro", "after effects", "social media",
    "youtube", "reels", "content strategy",
  ],

  // ── Salesforce ────────────────────────────────────────────────────────────
  "salesforce developer": [
    "salesforce", "apex", "lwc", "lightning", "soql", "sales cloud",
    "service cloud", "crm",
  ],
  "salesforce admin": [
    "salesforce", "flows", "process builder", "crm", "reports",
    "dashboards", "sales cloud",
  ],
  "salesforce architect": [
    "salesforce", "apex", "architecture", "integration", "mulesoft",
    "sales cloud", "crm",
  ],
  "salesforce consultant": [
    "salesforce", "crm", "sales cloud", "service cloud", "implementation",
    "customization",
  ],
  "apex developer": [
    "apex", "salesforce", "lwc", "soql", "triggers", "lightning",
  ],
  "lightning developer": [
    "lightning web components", "lwc", "apex", "salesforce", "javascript",
    "aura",
  ],

  // ── SAP ───────────────────────────────────────────────────────────────────
  "sap developer": [
    "sap", "abap", "sap hana", "fiori", "btp", "erp", "s4 hana",
  ],
  "sap consultant": [
    "sap", "erp", "s4 hana", "sap fico", "sap mm", "sap sd",
    "business processes",
  ],
  "sap abap developer": [
    "abap", "sap", "bapi", "idoc", "rfc", "oops abap", "s4 hana",
  ],
  "sap basis consultant": [
    "sap basis", "hana", "system administration", "transport management",
    "sap netweaver",
  ],
  "sap fico consultant": [
    "sap fico", "fi", "co", "s4 hana", "sap finance", "erp",
  ],
  "sap hana developer": [
    "sap hana", "sql", "cds views", "abap", "s4 hana", "btp",
  ],

  // ── CMS / eCommerce ───────────────────────────────────────────────────────
  "shopify developer": [
    "shopify", "liquid", "javascript", "html", "css", "ecommerce",
    "shopify apps", "react",
  ],
  "woocommerce developer": [
    "woocommerce", "wordpress", "php", "mysql", "ecommerce", "rest api",
  ],
  "drupal developer": [
    "drupal", "php", "mysql", "twig", "cms", "rest api",
  ],
  "webflow developer": [
    "webflow", "html", "css", "javascript", "no-code", "cms", "frontend",
  ],
  "ecommerce developer": [
    "shopify", "woocommerce", "magento", "php", "javascript",
    "react", "ecommerce",
  ],

  // ── Product / Project Management ──────────────────────────────────────────
  "product manager": [
    "product management", "agile", "roadmap", "user stories",
    "stakeholder management", "analytics", "jira",
  ],
  "technical product manager": [
    "product management", "agile", "technical requirements", "sql",
    "api", "jira", "roadmap",
  ],
  "product owner": [
    "agile", "scrum", "user stories", "backlog", "product management", "jira",
  ],
  "project manager": [
    "project management", "agile", "scrum", "jira", "stakeholder management",
    "risk management", "pmp",
  ],
  "scrum master": [
    "scrum", "agile", "jira", "sprint planning", "retrospectives",
    "kanban", "coaching",
  ],
  "agile coach": [
    "agile", "scrum", "kanban", "coaching", "transformation",
    "jira", "ceremonies",
  ],
  "program manager": [
    "program management", "agile", "stakeholder management",
    "roadmap", "pmp", "risk management",
  ],
  "delivery manager": [
    "delivery management", "agile", "scrum", "jira", "stakeholder management",
    "project management",
  ],

  // ── Solution / System Architecture ────────────────────────────────────────
  "solution architect": [
    "aws", "azure", "gcp", "microservices", "system design",
    "architecture", "cloud", "api design",
  ],
  "software architect": [
    "microservices", "system design", "cloud", "api design", "architecture",
    "distributed systems",
  ],
  "system architect": [
    "system design", "distributed systems", "microservices", "cloud",
    "architecture", "database design",
  ],
  "enterprise architect": [
    "enterprise architecture", "togaf", "cloud", "microservices",
    "system design", "integration",
  ],
  "technical architect": [
    "system design", "microservices", "cloud", "aws", "architecture",
    "api design", "backend",
  ],
  "project architect": [
    "system design", "solution architecture", "cloud", "microservices",
    "technical leadership", "api",
  ],

  // ── General Engineering ───────────────────────────────────────────────────
  "software engineer": [
    "javascript", "python", "java", "go", "typescript", "backend", "frontend",
    "full stack", "algorithms", "data structures",
  ],
  "senior software engineer": [
    "system design", "backend", "frontend", "full stack", "mentoring",
    "architecture", "code review",
  ],
  "software developer": [
    "javascript", "python", "java", "go", "typescript", "programming",
  ],
  "tech lead": [
    "architecture", "code review", "mentoring", "system design", "leadership",
  ],
  "engineering manager": [
    "management", "leadership", "agile", "scrum", "team lead", "hiring",
  ],
  "staff engineer": [
    "system design", "architecture", "distributed systems", "leadership", "mentoring",
  ],
  "principal engineer": [
    "system design", "architecture", "technical strategy", "leadership",
    "distributed systems",
  ],
  "cto": [
    "technology leadership", "architecture", "team building", "cloud",
    "system design", "engineering management",
  ],
  "vp engineering": [
    "engineering management", "leadership", "hiring", "architecture",
    "agile", "cloud",
  ],

  // ── IT Support / Networking ───────────────────────────────────────────────
  "it support engineer": [
    "help desk", "windows", "linux", "active directory", "networking",
    "troubleshooting", "ticketing",
  ],
  "help desk engineer": [
    "help desk", "windows", "active directory", "ticketing", "networking",
    "troubleshooting",
  ],
  "network administrator": [
    "networking", "cisco", "routing", "switching", "firewall", "vpn",
    "tcp/ip", "active directory",
  ],
  "it administrator": [
    "active directory", "windows server", "linux", "networking",
    "vmware", "azure ad", "troubleshooting",
  ],
  "cisco engineer": [
    "cisco", "ccna", "ccnp", "routing", "switching", "networking",
    "firewall", "vpn",
  ],
  "systems engineer": [
    "linux", "windows server", "aws", "networking", "bash",
    "system administration", "vmware",
  ],

  // ── ERP / CRM ─────────────────────────────────────────────────────────────
  "erp developer": [
    "erp", "sap", "odoo", "oracle", "dynamics 365", "implementation",
    "customization",
  ],
  "odoo developer": [
    "odoo", "python", "postgresql", "xml", "erp", "odoo modules",
  ],
  "zoho developer": [
    "zoho", "zoho crm", "deluge", "crm", "rest api", "integration",
  ],
  "hubspot developer": [
    "hubspot", "crm", "hubspot apis", "javascript", "integration",
    "marketing automation",
  ],
  "crm developer": [
    "salesforce", "dynamics 365", "hubspot", "zoho", "crm",
    "integration", "customization",
  ],

  // ── Low-code / No-code ────────────────────────────────────────────────────
  "power apps developer": [
    "power apps", "power platform", "power automate", "dataverse",
    "sharepoint", "microsoft 365",
  ],
  "power platform developer": [
    "power platform", "power apps", "power automate", "power bi",
    "dataverse", "microsoft 365",
  ],
  "power automate developer": [
    "power automate", "power platform", "power apps", "sharepoint",
    "microsoft 365", "workflow automation",
  ],
  "bubble developer": [
    "bubble", "no-code", "low-code", "api integration", "web app",
  ],
  "retool developer": [
    "retool", "javascript", "sql", "api integration", "low-code", "internal tools",
  ],
  "outsystems developer": [
    "outsystems", "low-code", "java", "sql", "integration",
  ],
  "mendix developer": [
    "mendix", "low-code", "java", "integration", "microflows",
  ],
  "low code developer": [
    "power apps", "bubble", "retool", "outsystems", "mendix",
    "low-code", "no-code",
  ],
  "no code developer": [
    "bubble", "webflow", "airtable", "zapier", "make", "no-code",
  ],

  // ── Microsoft Stack / Dynamics ────────────────────────────────────────────
  "dynamics 365 developer": [
    "dynamics 365", "c#", "power platform", "crm", "azure",
    "power apps", "javascript",
  ],
  "dynamics crm developer": [
    "dynamics crm", "c#", ".net", "power platform", "azure", "javascript",
  ],
  "microsoft dynamics developer": [
    "dynamics 365", "c#", ".net", "power platform", "azure", "crm",
  ],
  "sharepoint developer": [
    "sharepoint", "spfx", "javascript", "react", "power platform",
    "microsoft 365", "c#",
  ],
  "azure developer": [
    "azure", "c#", ".net", "azure functions", "cosmos db",
    "arm templates", "devops",
  ],

  // ── ServiceNow / Integration ──────────────────────────────────────────────
  "servicenow developer": [
    "servicenow", "javascript", "glide", "itsm", "workflows",
    "service portal", "integration",
  ],
  "servicenow admin": [
    "servicenow", "itsm", "workflows", "cmdb", "reporting",
    "configuration",
  ],
  "mulesoft developer": [
    "mulesoft", "anypoint platform", "api integration", "dataweave",
    "raml", "rest api", "integration",
  ],
  "boomi developer": [
    "boomi", "dell boomi", "api integration", "etl", "integration",
  ],
  "talend developer": [
    "talend", "etl", "java", "data integration", "sql",
    "data pipeline",
  ],
  "informatica developer": [
    "informatica", "powercenter", "idmc", "etl", "data integration",
    "sql",
  ],
  "integration developer": [
    "mulesoft", "boomi", "talend", "rest api", "soap", "middleware",
    "integration",
  ],
  "middleware developer": [
    "middleware", "mulesoft", "ibm mq", "kafka", "rest api",
    "soap", "integration",
  ],
  "solutions engineer": [
    "solution architecture", "api integration", "pre-sales", "cloud",
    "aws", "technical consulting",
  ],
  "integration engineer": [
    "api integration", "mulesoft", "rest api", "kafka", "microservices",
    "middleware", "backend",
  ],

  // ── Telecom / 5G ──────────────────────────────────────────────────────────
  "telecom engineer": [
    "telecom", "5g", "lte", "rf engineering", "voip", "networking",
    "python", "linux",
  ],
  "5g engineer": [
    "5g", "lte", "nr", "core network", "ran", "telecom", "networking",
  ],
  "rf engineer": [
    "rf", "radio frequency", "5g", "lte", "antenna", "matlab",
    "telecom",
  ],

  // ── Additional Languages ──────────────────────────────────────────────────
  "elixir developer": [
    "elixir", "phoenix", "erlang", "otp", "functional programming", "backend",
  ],
  "phoenix developer": [
    "phoenix", "elixir", "liveview", "ecto", "postgresql", "backend",
  ],
  "r developer": [
    "r", "rstudio", "ggplot2", "tidyverse", "statistics", "data science",
    "machine learning",
  ],

  // ── Technical Program Management ──────────────────────────────────────────
  "technical program manager": [
    "tpm", "program management", "agile", "jira", "stakeholder management",
    "technical requirements", "roadmap",
  ],
  "tpm": [
    "technical program management", "agile", "jira", "roadmap",
    "cross-functional", "stakeholder management",
  ],

  // ── Sales / Business Development ──────────────────────────────────────────
  "sales manager": [
    "sales", "crm", "salesforce", "b2b", "lead generation",
    "account management", "revenue",
  ],
  "sales executive": [
    "sales", "crm", "b2b", "lead generation", "cold calling",
    "negotiation", "salesforce",
  ],
  "business development manager": [
    "business development", "b2b", "crm", "partnerships",
    "lead generation", "sales", "account management",
  ],
  "business development executive": [
    "business development", "b2b", "lead generation", "sales",
    "crm", "cold calling",
  ],
  "account executive": [
    "sales", "crm", "account management", "b2b", "negotiation",
    "salesforce",
  ],
  "account manager": [
    "account management", "crm", "b2b", "client relationship",
    "salesforce", "upsell",
  ],

  // ── Marketing / SEO / SEM ─────────────────────────────────────────────────
  "seo specialist": [
    "seo", "google analytics", "ahrefs", "semrush", "keyword research",
    "on-page seo", "technical seo",
  ],
  "digital marketing specialist": [
    "seo", "sem", "google ads", "social media", "analytics",
    "content marketing", "email marketing",
  ],
  "performance marketer": [
    "google ads", "facebook ads", "performance marketing", "roas",
    "ppc", "analytics", "sem",
  ],
  "growth hacker": [
    "growth hacking", "a/b testing", "seo", "analytics", "product growth",
    "sql", "python",
  ],
  "sem specialist": [
    "google ads", "bing ads", "ppc", "sem", "analytics",
    "keyword research", "ad campaigns",
  ],
  "ppc specialist": [
    "ppc", "google ads", "facebook ads", "sem", "bid management",
    "analytics",
  ],
  "social media manager": [
    "social media", "instagram", "linkedin", "facebook", "content creation",
    "analytics", "community management",
  ],
  "email marketing specialist": [
    "email marketing", "mailchimp", "klaviyo", "automation",
    "segmentation", "analytics",
  ],
  "content marketing specialist": [
    "content marketing", "seo", "blogging", "social media",
    "analytics", "copywriting",
  ],
  "marketing automation specialist": [
    "hubspot", "marketo", "salesforce", "automation", "crm",
    "email marketing", "analytics",
  ],

  // ── Content / Writing ─────────────────────────────────────────────────────
  "content writer": [
    "content writing", "seo", "blogging", "copywriting",
    "social media", "wordpress",
  ],
  "technical writer": [
    "technical writing", "documentation", "markdown", "api docs",
    "confluence", "git",
  ],
  "copywriter": [
    "copywriting", "content writing", "advertising", "social media",
    "brand voice",
  ],
  "ux writer": [
    "ux writing", "content design", "figma", "ui copy", "user research",
    "microcopy",
  ],

  // ── Fintech / Finance IT ───────────────────────────────────────────────────
  "fintech developer": [
    "fintech", "payment gateway", "stripe", "razorpay", "banking api",
    "node.js", "python", "java",
  ],
  "payment gateway developer": [
    "stripe", "razorpay", "payment api", "node.js", "java",
    "security", "pci dss",
  ],
  "financial analyst": [
    "financial analysis", "excel", "sql", "power bi", "bloomberg",
    "modelling", "valuation",
  ],
  "quantitative developer": [
    "python", "c++", "quantitative finance", "algorithms", "trading",
    "statistics", "numpy",
  ],

  // ── Healthcare IT ─────────────────────────────────────────────────────────
  "healthcare it developer": [
    "hl7", "fhir", "emr", "ehrs", "python", "java", "healthcare",
    "api integration",
  ],
  "hl7 developer": [
    "hl7", "fhir", "mirth connect", "integration", "healthcare", "api",
  ],
  "fhir developer": [
    "fhir", "hl7", "rest api", "healthcare", "python", "java",
  ],
  "medical software developer": [
    "python", "java", "hl7", "fhir", "healthcare", "emr", "backend",
  ],

  // ── Operations ────────────────────────────────────────────────────────────
  "operations manager": [
    "operations", "process improvement", "lean", "six sigma", "project management",
    "stakeholder management", "analytics",
  ],
  "supply chain manager": [
    "supply chain", "logistics", "sap", "erp", "procurement",
    "inventory management", "vendor management",
  ],
  "logistics manager": [
    "logistics", "supply chain", "erp", "warehouse", "procurement",
    "inventory", "tracking",
  ],
  "procurement manager": [
    "procurement", "vendor management", "supply chain", "erp",
    "negotiation", "sap",
  ],

  // ── HR / People ───────────────────────────────────────────────────────────
  "hr manager": [
    "hr", "recruitment", "payroll", "hris", "performance management",
    "employee relations", "l&d",
  ],
  "hr executive": [
    "hr", "recruitment", "onboarding", "payroll", "hris",
    "employee relations",
  ],
  "hrbp": [
    "hr business partner", "hr", "talent management", "employee relations",
    "performance management", "coaching",
  ],
  "recruiter": [
    "recruitment", "sourcing", "linkedin", "talent acquisition",
    "ats", "screening", "hr",
  ],
  "technical recruiter": [
    "technical recruitment", "sourcing", "linkedin", "github",
    "screening", "it hiring", "ats",
  ],
  "talent acquisition specialist": [
    "talent acquisition", "recruitment", "sourcing", "linkedin",
    "ats", "employer branding",
  ],

  // ── Legal / Compliance ────────────────────────────────────────────────────
  "legal counsel": [
    "corporate law", "contracts", "compliance", "mergers and acquisitions",
    "legal advisory",
  ],
  "compliance officer": [
    "compliance", "regulatory", "risk management", "audit",
    "policies", "legal",
  ],

  // ── Finance / Accounting ──────────────────────────────────────────────────
  "chartered accountant": [
    "ca", "accounting", "audit", "tax", "ifrs", "financial reporting",
    "tally", "excel",
  ],
  "accountant": [
    "accounting", "tally", "excel", "gst", "tds", "financial reporting",
    "auditing",
  ],
  "finance manager": [
    "finance", "financial reporting", "budgeting", "excel",
    "erp", "sap", "forecasting",
  ],
  "investment analyst": [
    "financial modelling", "valuation", "excel", "bloomberg",
    "equity research", "due diligence",
  ],
  "risk analyst": [
    "risk management", "financial analysis", "excel", "sql",
    "compliance", "modelling",
  ],

  // ── Executive / Leadership ────────────────────────────────────────────────
  "vp sales": [
    "sales leadership", "revenue", "b2b", "crm", "team management",
    "forecasting", "sales strategy",
  ],
  "vp marketing": [
    "marketing strategy", "brand", "digital marketing", "team management",
    "analytics", "growth",
  ],
  "head of product": [
    "product strategy", "roadmap", "agile", "stakeholder management",
    "analytics", "team management",
  ],
  "director of engineering": [
    "engineering management", "hiring", "architecture", "agile",
    "cloud", "team building",
  ],
  "general manager": [
    "management", "p&l", "operations", "strategy", "leadership",
    "stakeholder management",
  ],
  "ceo": [
    "leadership", "strategy", "fundraising", "p&l", "team building",
    "vision", "stakeholder management",
  ],

}

/**
 * Expands a search query into a set of related terms using the skill taxonomy.
 * Example: "frontend developer" → ["react", "vue", "angular", "html", "css", ...]
 */
export function expandSearchQuery(query: string): string[] {
  const normalized = query.toLowerCase().trim()
  const terms = new Set<string>([normalized])

  // Add individual words from the query (skip very short noise words)
  normalized.split(/\s+/).forEach((word) => {
    if (word.length > 2) terms.add(word)
  })

  // Direct match: exact role or role contains/is contained by the query
  for (const [role, skills] of Object.entries(ROLE_SKILL_MAP)) {
    if (normalized === role || normalized.includes(role) || role.includes(normalized)) {
      terms.add(role)
      skills.forEach((skill) => terms.add(skill.toLowerCase()))
    }
  }

  // Reverse match: if query contains any known skill → add sibling skills from that role
  for (const [role, skills] of Object.entries(ROLE_SKILL_MAP)) {
    for (const skill of skills) {
      const skillLower = skill.toLowerCase()
      if (normalized.includes(skillLower) || skillLower.includes(normalized)) {
        terms.add(role)
        skills.forEach((s) => terms.add(s.toLowerCase()))
        break
      }
    }
  }

  // Remove very generic single-char or empty strings
  const cleaned = Array.from(terms).filter((t) => t.length > 1)

  // Limit to 30 terms to keep DB queries manageable
  return cleaned.slice(0, 30)
}
