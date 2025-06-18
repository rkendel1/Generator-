
export const mockRepos = [
    {
      id: 1,
      name: "react-dashboard-kit",
      description: "A comprehensive React dashboard template with modern UI components and analytics",
      language: "TypeScript",
      stargazers_count: 15420,
      forks_count: 3200,
      watchers_count: 890,
      created_at: "2024-01-15"
    },
    {
      id: 2,
      name: "ai-code-reviewer",
      description: "AI-powered code review tool that provides intelligent feedback and suggestions",
      language: "Python",
      stargazers_count: 8930,
      forks_count: 1200,
      watchers_count: 450,
      created_at: "2024-02-08"
    },
    {
      id: 3,
      name: "microservice-orchestrator",
      description: "Lightweight orchestration tool for microservices with service discovery",
      language: "Go",
      stargazers_count: 12100,
      forks_count: 2100,
      watchers_count: 650,
      created_at: "2024-01-22"
    },
    {
      id: 4,
      name: "design-system-builder",
      description: "Visual tool for creating and maintaining design systems across teams",
      language: "JavaScript",
      stargazers_count: 6750,
      forks_count: 890,
      watchers_count: 320,
      created_at: "2024-03-01"
    },
    {
      id: 5,
      name: "blockchain-validator",
      description: "High-performance blockchain validation and consensus mechanism",
      language: "Rust",
      stargazers_count: 9200,
      forks_count: 1500,
      watchers_count: 520,
      created_at: "2024-01-30"
    },
    {
      id: 6,
      name: "edge-computing-framework",
      description: "Framework for deploying and managing edge computing applications",
      language: "JavaScript",
      stargazers_count: 5680,
      forks_count: 760,
      watchers_count: 290,
      created_at: "2024-02-20"
    }
  ];
  
  export const generateIdeasForRepo = (repo: any) => {
    const ideaTemplates = [
      {
        title: "Remote UI Design Validator",
        score: 8,
        effort: 3,
        hook: "Transform this boilerplate into a collaborative UI validation platform for distributed design teams.",
        value: "Real-time UI feedback and validation system that helps remote teams maintain design consistency.",
        evidence: "78% of remote teams struggle with design consistency (Remote Work Report 2024)",
        differentiator: "AI-powered design pattern recognition with real-time collaboration features.",
        callToAction: "Launch MVP in 3 weeks to validate with 5 design agencies."
      },
      {
        title: "No-Code API Builder",
        score: 7,
        effort: 4,
        hook: "Convert this into a visual API building platform for non-technical users.",
        value: "Enables business users to create custom APIs without coding knowledge.",
        evidence: "85% of businesses need custom APIs but lack technical resources",
        differentiator: "Visual drag-and-drop interface with automatic documentation generation.",
        callToAction: "Build prototype in 4 weeks and test with 10 SMB customers."
      },
      {
        title: "Team Productivity Analytics",
        score: 6,
        effort: 5,
        hook: "Leverage this codebase to build advanced team performance analytics.",
        value: "Data-driven insights to optimize team productivity and project outcomes.",
        evidence: "Remote teams are 35% less productive without proper monitoring tools",
        differentiator: "Privacy-first analytics with predictive performance modeling.",
        callToAction: "Develop MVP in 6 weeks targeting distributed engineering teams."
      },
      {
        title: "Smart Documentation Generator",
        score: 9,
        effort: 2,
        hook: "Transform into an AI-powered documentation system that learns from codebases.",
        value: "Automatically generates and maintains up-to-date technical documentation.",
        evidence: "Developers spend 25% of their time on documentation tasks",
        differentiator: "Context-aware AI that understands code relationships and business logic.",
        callToAction: "Ship beta version in 2 weeks to 20 open-source projects."
      },
      {
        title: "Micro-SaaS Launcher",
        score: 7,
        effort: 6,
        hook: "Build a platform that helps developers launch micro-SaaS products quickly.",
        value: "Complete toolkit for rapid SaaS development and deployment.",
        evidence: "90% of developers have SaaS ideas but struggle with non-technical aspects",
        differentiator: "Integrated billing, analytics, and marketing automation in one platform.",
        callToAction: "Create beta program with 15 indie developers over 8 weeks."
      },
      {
        title: "Code Quality Scorecard",
        score: 8,
        effort: 3,
        hook: "Develop a comprehensive code quality assessment platform for development teams.",
        value: "Automated code quality scoring with actionable improvement recommendations.",
        evidence: "Poor code quality costs companies $85B annually in technical debt",
        differentiator: "ML-powered quality prediction with team-specific benchmarking.",
        callToAction: "Launch alpha with 12 development teams in 3 weeks."
      },
      {
        title: "Developer Onboarding Assistant",
        score: 6,
        effort: 4,
        hook: "Create an intelligent onboarding system for new developers joining teams.",
        value: "Personalized learning paths and mentorship matching for faster team integration.",
        evidence: "New developers take 6+ months to become fully productive",
        differentiator: "AI-powered skill gap analysis with peer mentorship networks.",
        callToAction: "Test with 8 engineering teams over 5 weeks."
      },
      {
        title: "Open Source Monetization Platform",
        score: 9,
        effort: 7,
        hook: "Build a platform helping open-source maintainers monetize their projects sustainably.",
        value: "Multiple revenue streams for OSS projects including sponsorships and premium features.",
        evidence: "98% of critical infrastructure runs on unpaid open-source projects",
        differentiator: "Integrated donation, subscription, and consulting marketplace.",
        callToAction: "Partner with 25 popular OSS projects for 10-week pilot program."
      },
      {
        title: "API Security Scanner",
        score: 8,
        effort: 5,
        hook: "Transform into a comprehensive API security testing and monitoring platform.",
        value: "Continuous API security scanning with vulnerability alerts and remediation guidance.",
        evidence: "API attacks increased 681% in 2023, affecting 90% of organizations",
        differentiator: "Real-time threat detection with automated penetration testing.",
        callToAction: "Deploy beta with 15 security-conscious startups in 6 weeks."
      },
      {
        title: "Feature Flag Analytics",
        score: 7,
        effort: 4,
        hook: "Create an advanced analytics platform for feature flag performance optimization.",
        value: "Data-driven feature rollout decisions with user behavior impact analysis.",
        evidence: "73% of companies use feature flags but lack proper analytics",
        differentiator: "Predictive modeling for feature success with A/B testing integration.",
        callToAction: "Validate with 20 product teams using feature flags over 4 weeks."
      }
    ];
  
    // Return random 10 ideas for demo purposes
    return ideaTemplates.sort(() => 0.5 - Math.random()).slice(0, 10);
  };