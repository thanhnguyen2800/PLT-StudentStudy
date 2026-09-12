import React, { useState } from 'react';
import { FaCopy, FaRocket, FaBrain, FaGraduationCap, FaChartLine, FaCode, FaFlask, FaBook, FaUsers, FaGamepad, FaFilePdf, FaFileAlt, FaVideo, FaHeadphones, FaImage, FaLink, FaBookOpen } from 'react-icons/fa';

interface PromptsProps {
  showToastMessage: (message: string) => void;
}

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  example?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
}

export const Prompts: React.FC<PromptsProps> = ({ showToastMessage }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const promptTemplates: PromptTemplate[] = [
    {
      id: 'pdf-document-quiz',
      title: 'PDF Document Analysis Quiz',
      description: 'Generate comprehensive quizzes from uploaded PDF documents, textbooks, or research papers',
      category: 'document-analysis',
      icon: FaFilePdf,
      difficulty: 'Intermediate',
      estimatedTime: '10-20 min',
      prompt: `I have uploaded a PDF document. Please analyze this document thoroughly and create a comprehensive quiz based on its content.

DOCUMENT ANALYSIS REQUIREMENTS:
- Read through the entire document carefully
- Identify the main topics, concepts, and key information
- Note any diagrams, tables, charts, or visual elements
- Understand the document's structure and organization
- Determine the intended audience and complexity level

QUIZ SPECIFICATIONS:
- Generate [NUMBER] questions based on the document content
- Include multiple question types: multiple choice, true/false, short answer
- Cover different cognitive levels: recall, comprehension, application, analysis
- Reference specific sections, pages, or chapters where relevant
- Include questions about visual elements if present (charts, diagrams, etc.)

QUESTION CATEGORIES TO INCLUDE:
- Key concepts and definitions from the document
- Main arguments or findings presented
- Supporting evidence and examples
- Cause-and-effect relationships
- Comparisons and contrasts discussed
- Conclusions and implications
- Data interpretation (if applicable)

JSON FORMAT (REQUIRED):
{
  "title": "Quiz: [DOCUMENT_TITLE/TOPIC]",
  "questions": [
    {
      "question": "Based on the document, [QUESTION TEXT]?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "time": 45
    },
    {
      "question": "According to page X, what is the main conclusion about [TOPIC]?",
      "options": ["Conclusion A", "Conclusion B", "Conclusion C", "Conclusion D"],
      "correct": 2,
      "time": 60
    }
  ]
}

Number of questions: [REPLACE WITH NUMBER]
Focus areas: [ALL CONTENT / SPECIFIC CHAPTERS / KEY CONCEPTS]
Difficulty level: [BEGINNER / INTERMEDIATE / ADVANCED]
Question distribution: [SPECIFY PERCENTAGE FOR EACH QUESTION TYPE]`,
      example: 'Number of questions: 15\nFocus areas: All content\nDifficulty level: Intermediate\nQuestion distribution: 60% multiple choice, 25% true/false, 15% short answer'
    },
    {
      id: 'lecture-notes-quiz',
      title: 'Lecture Notes & Study Materials Quiz',
      description: 'Transform handwritten or typed notes, study guides, and lecture materials into structured quizzes',
      category: 'document-analysis',
      icon: FaFileAlt,
      difficulty: 'Beginner',
      estimatedTime: '8-15 min',
      prompt: `I have uploaded my lecture notes or study materials. Please create a comprehensive quiz to help me study and retain this information.

NOTES ANALYSIS INSTRUCTIONS:
- Carefully read through all the notes provided
- Identify key concepts, terms, definitions, and important facts
- Look for emphasized points (bold, highlighted, repeated information)
- Note any examples, case studies, or practical applications mentioned
- Identify relationships between different concepts
- Pay attention to any formulas, processes, or step-by-step procedures

QUIZ CREATION GUIDELINES:
- Generate [NUMBER] questions covering the most important material
- Mix question types: definitions, applications, examples, connections
- Focus on material that's likely to appear on exams
- Include questions that test both memorization and understanding
- Create questions about practical applications where mentioned
- Test knowledge of examples and case studies provided

JSON FORMAT (REQUIRED):
{
  "title": "[SUBJECT] Study Quiz from Notes",
  "questions": [
    {
      "question": "According to your notes, what is [CONCEPT]?",
      "options": ["Definition A", "Definition B", "Definition C", "Definition D"],
      "correct": 0,
      "time": 30
    },
    {
      "question": "Which example from the notes best illustrates [PRINCIPLE]?",
      "options": ["Example A", "Example B", "Example C", "Example D"],
      "correct": 1,
      "time": 45
    }
  ]
}

Subject: [REPLACE WITH SUBJECT]
Number of questions: [REPLACE WITH NUMBER]
Study goal: [EXAM PREP / REVIEW / MASTERY CHECK]
Question focus: [DEFINITIONS / APPLICATIONS / MIXED]`,
      example: 'Subject: Psychology\nNumber of questions: 12\nStudy goal: Exam preparation\nQuestion focus: Mixed (definitions and applications)'
    },
    {
      id: 'video-transcript-quiz',
      title: 'Video/Audio Transcript Quiz',
      description: 'Create quizzes from video lectures, podcasts, or audio content transcripts',
      category: 'document-analysis',
      icon: FaVideo,
      difficulty: 'Intermediate',
      estimatedTime: '12-18 min',
      prompt: `I have provided a transcript from a video lecture, podcast, or audio content. Please create an engaging quiz based on this material.

TRANSCRIPT ANALYSIS APPROACH:
- Read through the entire transcript carefully
- Identify the main topics and key points discussed
- Note any examples, stories, or case studies mentioned
- Pay attention to expert opinions, insights, or unique perspectives
- Look for actionable advice or practical applications
- Identify any data, statistics, or research mentioned
- Note the speaker's main arguments or conclusions

VIDEO/AUDIO CONTENT CONSIDERATIONS:
- Account for the conversational nature of spoken content
- Focus on the most important and memorable points
- Include questions about practical applications discussed
- Test understanding of expert insights and opinions
- Create questions about examples and real-world scenarios
- Include questions about the speaker's recommendations or advice

JSON FORMAT (REQUIRED):
{
  "title": "Quiz: [VIDEO/PODCAST TITLE]",
  "questions": [
    {
      "question": "According to the speaker, what is the best approach to [TOPIC]?",
      "options": ["Approach A", "Approach B", "Approach C", "Approach D"],
      "correct": 0,
      "time": 45
    },
    {
      "question": "What example did the speaker use to illustrate [CONCEPT]?",
      "options": ["Example A", "Example B", "Example C", "Example D"],
      "correct": 2,
      "time": 30
    }
  ]
}

Content type: [LECTURE / PODCAST / INTERVIEW / PRESENTATION]
Number of questions: [REPLACE WITH NUMBER]
Focus area: [KEY INSIGHTS / PRACTICAL TIPS / MAIN CONCEPTS / ALL CONTENT]
Question style: [ACADEMIC / PRACTICAL / MIXED]`,
      example: 'Content type: Educational podcast\nNumber of questions: 10\nFocus area: Practical tips and key insights\nQuestion style: Mixed academic and practical'
    },
    {
      id: 'textbook-chapter-quiz',
      title: 'Textbook Chapter Analysis Quiz',
      description: 'Comprehensive quiz generation from textbook chapters with learning objectives alignment',
      category: 'document-analysis',
      icon: FaBookOpen,
      difficulty: 'Advanced',
      estimatedTime: '15-25 min',
      prompt: `I have uploaded a textbook chapter or academic text. Please create a comprehensive quiz that aligns with typical learning objectives for this material.

TEXTBOOK ANALYSIS PROTOCOL:
- Identify the chapter title, learning objectives, and key concepts
- Analyze headings, subheadings, and section organization
- Extract important definitions, theories, and principles
- Note all examples, case studies, and practical applications
- Identify any formulas, processes, or methodologies
- Pay attention to charts, graphs, tables, and visual aids
- Look for summary sections, key points, and review material
- Consider end-of-chapter questions or exercises if present

ACADEMIC QUIZ STANDARDS:
- Align questions with Bloom's Taxonomy levels
- Include prerequisite knowledge checks
- Test understanding of core concepts and theories
- Create application problems using chapter examples
- Include analysis questions for complex topics
- Test synthesis of multiple concepts
- Evaluate understanding through scenario-based questions

JSON FORMAT (REQUIRED):
{
  "title": "[TEXTBOOK NAME] - Chapter [X]: [CHAPTER TITLE]",
  "questions": [
    {
      "question": "Based on the chapter content, what is the primary definition of [CONCEPT]?",
      "options": ["Definition A", "Definition B", "Definition C", "Definition D"],
      "correct": 0,
      "time": 60
    },
    {
      "question": "Which example from the textbook best demonstrates [PRINCIPLE]?",
      "options": ["Example A", "Example B", "Example C", "Example D"],
      "correct": 1,
      "time": 45
    }
  ]
}

Textbook subject: [REPLACE WITH SUBJECT]
Chapter focus: [FULL CHAPTER / SPECIFIC SECTIONS]
Number of questions: [REPLACE WITH NUMBER]
Assessment level: [UNDERGRADUATE / GRADUATE / PROFESSIONAL]
Question distribution: [SPECIFY BLOOM'S LEVELS EMPHASIS]`,
      example: 'Textbook subject: Organic Chemistry\nChapter focus: Full chapter\nNumber of questions: 20\nAssessment level: Undergraduate\nQuestion distribution: 30% remember/understand, 40% apply, 30% analyze/evaluate'
    },
    {
      id: 'research-paper-quiz',
      title: 'Research Paper & Journal Article Quiz',
      description: 'Academic quiz generation from research papers, journal articles, and scholarly publications',
      category: 'document-analysis',
      icon: FaFlask,
      difficulty: 'Advanced',
      estimatedTime: '20-30 min',
      prompt: `I have uploaded a research paper or journal article. Please create an academic-level quiz that tests understanding of the research methodology, findings, and implications.

RESEARCH PAPER ANALYSIS:
- Identify the research question, hypothesis, and objectives
- Analyze the methodology and experimental design
- Extract key findings, results, and statistical data
- Understand the discussion, conclusions, and implications
- Note limitations and suggestions for future research
- Identify the theoretical framework and literature review
- Pay attention to figures, tables, and data presentations
- Consider the significance and impact of the research

ACADEMIC RESEARCH QUIZ FOCUS:
- Test understanding of research methodology
- Include questions about data interpretation
- Assess comprehension of statistical results
- Evaluate understanding of theoretical implications
- Test critical analysis skills
- Include questions about research limitations
- Assess ability to connect findings to broader field
- Test understanding of future research directions

JSON FORMAT (REQUIRED):
{
  "title": "Research Analysis: [PAPER TITLE]",
  "questions": [
    {
      "question": "What was the primary research question addressed in this study?",
      "options": ["Question A", "Question B", "Question C", "Question D"],
      "correct": 0,
      "time": 90
    },
    {
      "question": "Which methodology was used to collect the primary data?",
      "options": ["Method A", "Method B", "Method C", "Method D"],
      "correct": 2,
      "time": 60
    }
  ]
}

Research field: [REPLACE WITH FIELD]
Academic level: [UNDERGRADUATE / GRADUATE / PROFESSIONAL]
Number of questions: [REPLACE WITH NUMBER]
Focus areas: [METHODOLOGY / RESULTS / DISCUSSION / ALL SECTIONS]
Question complexity: [COMPREHENSION / ANALYSIS / EVALUATION / MIXED]`,
      example: 'Research field: Psychology\nAcademic level: Graduate\nNumber of questions: 15\nFocus areas: All sections\nQuestion complexity: Mixed analysis and evaluation'
    },
    {
      id: 'presentation-slides-quiz',
      title: 'Presentation Slides Quiz',
      description: 'Generate quizzes from PowerPoint presentations, slide decks, and visual presentations',
      category: 'document-analysis',
      icon: FaImage,
      difficulty: 'Intermediate',
      estimatedTime: '10-15 min',
      prompt: `I have uploaded presentation slides or a slide deck. Please create a quiz based on the content, taking into account the visual and structured nature of the material.

SLIDE PRESENTATION ANALYSIS:
- Examine each slide's main points and key messages
- Pay attention to slide titles and headers
- Analyze bullet points, lists, and structured information
- Note any charts, graphs, diagrams, or visual elements
- Identify the presentation flow and logical progression
- Look for emphasized text, highlighted information, or call-outs
- Consider any speaker notes or additional context provided
- Understand the overall presentation objectives and goals

VISUAL CONTENT CONSIDERATIONS:
- Include questions about charts, graphs, and visual data
- Test understanding of diagrams and flowcharts
- Create questions about image content and visual examples
- Include questions about slide organization and structure
- Test comprehension of visual relationships and connections
- Consider questions about design elements that convey meaning

JSON FORMAT (REQUIRED):
{
  "title": "Quiz: [PRESENTATION TITLE]",
  "questions": [
    {
      "question": "According to slide [X], what is the main benefit of [TOPIC]?",
      "options": ["Benefit A", "Benefit B", "Benefit C", "Benefit D"],
      "correct": 0,
      "time": 30
    },
    {
      "question": "What data point was highlighted in the [CHART TYPE] on slide [Y]?",
      "options": ["Data A", "Data B", "Data C", "Data D"],
      "correct": 1,
      "time": 45
    }
  ]
}

Presentation type: [BUSINESS / ACADEMIC / TRAINING / CONFERENCE]
Number of questions: [REPLACE WITH NUMBER]
Content focus: [KEY MESSAGES / VISUAL DATA / CONCEPTS / ALL CONTENT]
Audience level: [BEGINNER / INTERMEDIATE / ADVANCED / MIXED]`,
      example: 'Presentation type: Business training\nNumber of questions: 12\nContent focus: Key messages and visual data\nAudience level: Intermediate'
    },
    {
      id: 'web-article-quiz',
      title: 'Web Article & Blog Post Quiz',
      description: 'Create quizzes from online articles, blog posts, and web-based content',
      category: 'document-analysis',
      icon: FaLink,
      difficulty: 'Beginner',
      estimatedTime: '8-12 min',
      prompt: `I have provided content from a web article or blog post. Please create an engaging quiz that captures the main ideas and important information.

WEB CONTENT ANALYSIS:
- Read through the entire article carefully
- Identify the main topic, thesis, or central argument
- Note key points, supporting evidence, and examples
- Pay attention to subheadings and section organization
- Look for actionable advice, tips, or recommendations
- Identify any data, statistics, or research mentioned
- Note expert quotes, opinions, or cited sources
- Consider the author's perspective and conclusions

ONLINE CONTENT CONSIDERATIONS:
- Account for the informal, accessible writing style
- Focus on practical, applicable information
- Include questions about real-world examples provided
- Test understanding of the author's main arguments
- Create questions about actionable advice or tips
- Include questions that test critical thinking about the content
- Consider the target audience and adjust complexity accordingly

JSON FORMAT (REQUIRED):
{
  "title": "Quiz: [ARTICLE TITLE]",
  "questions": [
    {
      "question": "According to the article, what is the main reason for [TOPIC]?",
      "options": ["Reason A", "Reason B", "Reason C", "Reason D"],
      "correct": 0,
      "time": 30
    },
    {
      "question": "What practical tip does the author suggest for [SITUATION]?",
      "options": ["Tip A", "Tip B", "Tip C", "Tip D"],
      "correct": 2,
      "time": 45
    }
  ]
}

Article type: [NEWS / OPINION / HOW-TO / ANALYSIS / REVIEW]
Number of questions: [REPLACE WITH NUMBER]
Question focus: [MAIN IDEAS / PRACTICAL TIPS / ANALYSIS / MIXED]
Complexity level: [GENERAL AUDIENCE / SPECIALIZED / ACADEMIC]`,
      example: 'Article type: How-to guide\nNumber of questions: 8\nQuestion focus: Practical tips and main ideas\nComplexity level: General audience'
    },
    {
      id: 'mixed-documents-quiz',
      title: 'Multi-Document Comprehensive Quiz',
      description: 'Synthesize information from multiple uploaded documents to create integrated quizzes',
      category: 'document-analysis',
      icon: FaFileAlt,
      difficulty: 'Advanced',
      estimatedTime: '20-35 min',
      prompt: `I have uploaded multiple documents on related topics. Please analyze all documents and create a comprehensive quiz that synthesizes information across sources.

MULTI-DOCUMENT ANALYSIS APPROACH:
- Read and analyze each document thoroughly
- Identify common themes and overlapping topics
- Note different perspectives or approaches to the same subject
- Look for complementary information that builds understanding
- Identify contradictions or differing viewpoints between sources
- Find connections and relationships between documents
- Consider how documents support or challenge each other
- Analyze the credibility and authority of different sources

SYNTHESIS QUIZ CREATION:
- Create questions that integrate information from multiple sources
- Include questions comparing different approaches or perspectives
- Test understanding of how sources relate to each other
- Create questions about overarching themes across documents
- Include questions requiring analysis of multiple viewpoints
- Test ability to synthesize information into new understanding
- Create questions about source credibility and reliability

JSON FORMAT (REQUIRED):
{
  "title": "Comprehensive Quiz: [OVERALL TOPIC]",
  "questions": [
    {
      "question": "Based on multiple sources, what is the most comprehensive understanding of [TOPIC]?",
      "options": ["Synthesis A", "Synthesis B", "Synthesis C", "Synthesis D"],
      "correct": 0,
      "time": 90
    },
    {
      "question": "Which source provides the strongest evidence for [CLAIM]?",
      "options": ["Document A", "Document B", "Document C", "Document D"],
      "correct": 1,
      "time": 75
    }
  ]
}

Overall topic: [REPLACE WITH MAIN TOPIC]
Number of documents: [REPLACE WITH COUNT]
Number of questions: [REPLACE WITH NUMBER]
Synthesis focus: [COMPARISON / INTEGRATION / EVALUATION / COMPREHENSIVE]
Question complexity: [INTERMEDIATE / ADVANCED / EXPERT LEVEL]`,
      example: 'Overall topic: Climate Change Solutions\nNumber of documents: 4\nNumber of questions: 18\nSynthesis focus: Integration and evaluation\nQuestion complexity: Advanced'
    },
    {
      id: 'general-quiz',
      title: 'General Knowledge Quiz',
      description: 'Create a comprehensive quiz on any topic with multiple difficulty levels',
      category: 'general',
      icon: FaBrain,
      difficulty: 'Beginner',
      estimatedTime: '8-12 min',
      prompt: `Create a multiple-choice quiz about [TOPIC] with the following specifications:

- Generate [NUMBER] questions (suggested: 10-15)
- Include questions of varying difficulty: easy, medium, and hard
- Each question should have 4 answer options (A, B, C, D)
- Clearly indicate the correct answer
- Set appropriate time limits (15-30 seconds per question)
- Include brief explanations for correct answers when helpful

JSON FORMAT (REQUIRED):
{
  "title": "[TOPIC] Quiz",
  "questions": [
    {
      "question": "What is [BASIC_CONCEPT] in [TOPIC]?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2,
      "time": 20
    },
    {
      "question": "Which of the following best describes [ADVANCED_CONCEPT]?",
      "options": ["Description A", "Description B", "Description C", "Description D"],
      "correct": 0,
      "time": 30
    }
  ]
}

Topic: [REPLACE WITH YOUR TOPIC]
Number of questions: [REPLACE WITH NUMBER]`,
      example: 'Topic: World Geography\nNumber of questions: 12'
    },
    {
      id: 'academic-subject',
      title: 'Academic Subject Quiz',
      description: 'Create educational quizzes aligned with curriculum standards',
      category: 'education',
      icon: FaGraduationCap,
      difficulty: 'Intermediate',
      estimatedTime: '10-15 min',
      prompt: `Create an educational quiz for [SUBJECT] targeting [GRADE_LEVEL] students:

Requirements:
- Align with standard curriculum objectives
- Include [NUMBER] questions covering key concepts
- Mix of factual recall, comprehension, and application questions
- Age-appropriate language and examples
- Include learning objectives being tested
- Provide detailed explanations for educational value

Focus areas to cover:
- [LIST 3-5 KEY TOPICS/CONCEPTS]

JSON FORMAT (REQUIRED):
{
  "title": "[SUBJECT] - [TOPIC] Assessment",
  "questions": [
    {
      "question": "What is the primary function of [CONCEPT] in [SUBJECT]?",
      "options": ["Function A", "Function B", "Function C", "Function D"],
      "correct": 0,
      "time": 30
    },
    {
      "question": "Which example best demonstrates [PRINCIPLE] in real life?",
      "options": ["Example A", "Example B", "Example C", "Example D"],
      "correct": 1,
      "time": 45
    }
  ]
}

Subject: [REPLACE WITH SUBJECT]
Grade Level: [REPLACE WITH GRADE]
Number of questions: [REPLACE WITH NUMBER]
Key topics: [LIST YOUR TOPICS]`,
      example: 'Subject: Biology\nGrade Level: High School (9th-10th)\nKey topics: Cell structure, Photosynthesis, Mitosis, DNA'
    },
    {
      id: 'coding-quiz',
      title: 'Programming & Tech Quiz',
      description: 'Create technical quizzes for programming languages and concepts',
      category: 'technology',
      icon: FaCode,
      difficulty: 'Intermediate',
      estimatedTime: '12-18 min',
      prompt: `Create a technical quiz about [PROGRAMMING_TOPIC]:

Technical focus:
- [PROGRAMMING_LANGUAGE] concepts and syntax
- Best practices and code quality
- Problem-solving scenarios
- [SKILL_LEVEL] level content
- Include code snippets where relevant

Question categories:
- Syntax and language features
- Algorithm and data structure concepts
- Debugging and troubleshooting
- Code optimization and best practices
- Real-world application scenarios

JSON FORMAT (REQUIRED):
{
  "title": "[PROGRAMMING_TOPIC] Technical Assessment",
  "questions": [
    {
      "question": "What will this code output?\\n\\n\`\`\`[LANGUAGE]\\n[CODE_SNIPPET]\\n\`\`\`",
      "options": ["Output A", "Output B", "Error", "None of the above"],
      "correct": 0,
      "time": 60
    },
    {
      "question": "Which is the best practice for [PROGRAMMING_CONCEPT]?",
      "options": ["Practice A", "Practice B", "Practice C", "Practice D"],
      "correct": 2,
      "time": 45
    }
  ]
}

Programming Topic: [REPLACE WITH TOPIC]
Programming Language: [REPLACE WITH LANGUAGE]
Skill Level: [BEGINNER/INTERMEDIATE/ADVANCED]
Number of questions: [REPLACE WITH NUMBER]`,
      example: 'Programming Topic: JavaScript Arrays\nProgramming Language: JavaScript\nSkill Level: Intermediate'
    },
    {
      id: 'business-professional',
      title: 'Business & Professional Skills Quiz',
      description: 'Workplace competency assessments and professional development quizzes',
      category: 'professional',
      icon: FaChartLine,
      difficulty: 'Intermediate',
      estimatedTime: '12-18 min',
      prompt: `Create a professional assessment quiz for [BUSINESS_TOPIC/SKILL]:

Professional Focus Areas:
- Industry best practices and standards
- Leadership and management concepts
- Communication and interpersonal skills
- Problem-solving and decision-making
- Ethics and compliance considerations
- Strategic thinking and planning

Assessment Categories:
- Situational judgment questions
- Best practice scenarios
- Regulatory and compliance knowledge
- Industry-specific terminology
- Professional development concepts
- Real-world application challenges

JSON FORMAT (REQUIRED):
{
  "title": "[BUSINESS_TOPIC] Professional Assessment",
  "questions": [
    {
      "question": "In a professional setting, what is the most effective approach to [SITUATION]?",
      "options": ["Approach A", "Approach B", "Approach C", "Approach D"],
      "correct": 1,
      "time": 45
    },
    {
      "question": "Which principle best guides [PROFESSIONAL_SCENARIO]?",
      "options": ["Principle A", "Principle B", "Principle C", "Principle D"],
      "correct": 0,
      "time": 60
    }
  ]
}

Business Topic: [REPLACE WITH TOPIC]
Industry Focus: [REPLACE WITH INDUSTRY]
Professional Level: [ENTRY/MID/SENIOR/EXECUTIVE]
Number of questions: [REPLACE WITH NUMBER]`,
      example: 'Business Topic: Project Management\nIndustry Focus: Technology\nProfessional Level: Mid-level\nNumber of questions: 15'
    },
    {
      id: 'science-medical',
      title: 'Science & Medical Knowledge Quiz',
      description: 'Comprehensive assessments for scientific concepts and medical knowledge',
      category: 'science',
      icon: FaFlask,
      difficulty: 'Advanced',
      estimatedTime: '15-20 min',
      prompt: `Create a comprehensive science/medical quiz for [SCIENTIFIC_FIELD]:

Scientific Rigor Requirements:
- Evidence-based questions with current research
- Proper scientific terminology and concepts
- Multi-step reasoning and analysis
- Experimental design and methodology
- Data interpretation and statistical concepts
- Clinical applications (for medical topics)

Knowledge Areas to Cover:
- Fundamental principles and theories
- Current research and developments
- Practical applications and case studies
- Ethical considerations in science/medicine
- Interdisciplinary connections
- Problem-solving methodologies

JSON FORMAT (REQUIRED):
{
  "title": "[SCIENTIFIC_FIELD] Knowledge Assessment",
  "questions": [
    {
      "question": "What is the primary mechanism underlying [SCIENTIFIC_PROCESS]?",
      "options": ["Mechanism A", "Mechanism B", "Mechanism C", "Mechanism D"],
      "correct": 2,
      "time": 90
    },
    {
      "question": "In a research study examining [PHENOMENON], which methodology would be most appropriate?",
      "options": ["Method A", "Method B", "Method C", "Method D"],
      "correct": 0,
      "time": 75
    }
  ]
}

Scientific Field: [REPLACE WITH FIELD]
Academic Level: [UNDERGRADUATE/GRADUATE/PROFESSIONAL]
Specialization: [REPLACE WITH SPECIALTY]
Number of questions: [REPLACE WITH NUMBER]`,
      example: 'Scientific Field: Neuroscience\nAcademic Level: Graduate\nSpecialization: Cognitive neuroscience\nNumber of questions: 20'
    },
    {
      id: 'literature-humanities',
      title: 'Literature & Humanities Quiz',
      description: 'Cultural literacy and humanities knowledge assessments',
      category: 'literature',
      icon: FaBook,
      difficulty: 'Intermediate',
      estimatedTime: '10-15 min',
      prompt: `Create a comprehensive quiz for [HUMANITIES_SUBJECT]:

Humanities Focus Areas:
- Literary analysis and interpretation
- Historical context and cultural significance
- Thematic analysis and symbolism
- Author biography and influences
- Artistic movements and periods
- Critical thinking and evaluation

Assessment Dimensions:
- Factual knowledge (authors, dates, works)
- Conceptual understanding (themes, movements)
- Analytical skills (interpretation, comparison)
- Cultural literacy (context, significance)
- Creative connections (influences, parallels)
- Critical evaluation (quality, impact)

JSON FORMAT (REQUIRED):
{
  "title": "[HUMANITIES_SUBJECT] Knowledge Quiz",
  "questions": [
    {
      "question": "What is the central theme of [LITERARY_WORK] by [AUTHOR]?",
      "options": ["Theme A", "Theme B", "Theme C", "Theme D"],
      "correct": 1,
      "time": 45
    },
    {
      "question": "Which literary movement is characterized by [CHARACTERISTICS]?",
      "options": ["Movement A", "Movement B", "Movement C", "Movement D"],
      "correct": 0,
      "time": 60
    }
  ]
}

Humanities Subject: [REPLACE WITH SUBJECT]
Time Period: [REPLACE WITH ERA/PERIOD]
Geographic Focus: [REPLACE WITH REGION/CULTURE]
Number of questions: [REPLACE WITH NUMBER]`,
      example: 'Humanities Subject: American Literature\nTime Period: 19th Century\nGeographic Focus: United States\nNumber of questions: 12'
    },
    {
      id: 'current-events',
      title: 'Current Events & News Quiz',
      description: 'Stay updated with recent news, politics, and global events',
      category: 'general',
      icon: FaBrain,
      difficulty: 'Intermediate',
      estimatedTime: '8-12 min',
      prompt: `Create a current events quiz covering [TIME_PERIOD] and [TOPIC_FOCUS]:

Current Events Categories:
- Politics and government developments
- International relations and global affairs
- Economic trends and business news
- Technology and innovation updates
- Environmental and climate issues
- Social and cultural movements
- Sports and entertainment highlights
- Health and scientific breakthroughs

News Analysis Skills:
- Fact recognition and recall
- Understanding of implications
- Cause and effect relationships
- Multiple perspective awareness
- Media literacy and source evaluation
- Timeline and chronological understanding

JSON FORMAT (REQUIRED):
{
  "title": "Current Events Quiz: [TIME_PERIOD]",
  "questions": [
    {
      "question": "What major development occurred in [REGION/FIELD] during [TIME_PERIOD]?",
      "options": ["Event A", "Event B", "Event C", "Event D"],
      "correct": 2,
      "time": 30
    },
    {
      "question": "Which leader/organization was primarily responsible for [SIGNIFICANT_EVENT]?",
      "options": ["Leader A", "Leader B", "Leader C", "Leader D"],
      "correct": 0,
      "time": 45
    }
  ]
}

Time Period: [LAST MONTH/QUARTER/YEAR]
Topic Focus: [POLITICS/BUSINESS/TECHNOLOGY/GLOBAL/etc.]
Geographic Scope: [LOCAL/NATIONAL/INTERNATIONAL]
Number of questions: [REPLACE WITH NUMBER]`,
      example: 'Time Period: Last 3 months\nTopic Focus: International affairs\nGeographic Scope: Global\nNumber of questions: 10'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: FaBrain },
    { id: 'document-analysis', name: 'Document Analysis', icon: FaFilePdf },
    { id: 'general', name: 'General Knowledge', icon: FaBrain },
    { id: 'education', name: 'Education', icon: FaGraduationCap },
    { id: 'professional', name: 'Professional', icon: FaChartLine },
    { id: 'technology', name: 'Technology', icon: FaCode },
    { id: 'science', name: 'Science', icon: FaFlask },
    { id: 'literature', name: 'Literature', icon: FaBook },
    { id: 'advanced', name: 'Advanced Features', icon: FaRocket }
  ];

  const filteredPrompts = selectedCategory === 'all'
    ? promptTemplates
    : promptTemplates.filter((prompt: PromptTemplate) => prompt.category === selectedCategory);

  const copyToClipboard = async (text: string, promptId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(promptId);
      if (typeof showToastMessage === 'function') {
        showToastMessage('Prompt copied to clipboard!');
      }
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      if (typeof showToastMessage === 'function') {
        showToastMessage('Failed to copy prompt. Please try again.');
      }
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3" style={{ color: '#305F72' }}>
          <FaRocket style={{ color: '#568EA6' }} />
          Premium AI Quiz Prompts
        </h2>
        <p className="max-w-4xl mx-auto" style={{ color: '#305F72', opacity: 0.8 }}>
          Advanced prompt templates designed by educational experts to generate sophisticated,
          pedagogically-sound quizzes with AI. All prompts now follow the standardized JSON format for consistent quiz generation.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedCategory === category.id
                ? 'text-white shadow-lg'
                : 'bg-white/80 hover:bg-white border'
                }`}
              style={
                selectedCategory === category.id
                  ? { backgroundColor: '#568EA6' }
                  : { color: '#305F72', borderColor: '#F0B7A4' }
              }
            >
              <IconComponent className="w-4 h-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Prompt Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrompts.map((template: PromptTemplate) => {
          const IconComponent = template.icon;
          return (
            <div
              key={template.id}
              className="bg-white/80 backdrop-blur-sm border rounded-xl p-6 hover:shadow-xl transition-all duration-300 shadow-lg"
              style={{ borderColor: '#F0B7A4' }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#568EA6' }}>
                  <IconComponent className="text-white w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold" style={{ color: '#305F72' }}>
                      {template.title}
                    </h3>
                    {template.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${template.difficulty === 'Beginner' ? 'text-green-700' :
                        template.difficulty === 'Intermediate' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}
                        style={{
                          backgroundColor: template.difficulty === 'Beginner' ? '#F0B7A4' :
                            template.difficulty === 'Intermediate' ? '#F0F4F8' :
                              '#F18C8E'
                        }}>
                        {template.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#305F72', opacity: 0.8 }}>
                    {template.description}
                  </p>
                  {template.estimatedTime && (
                    <p className="text-xs" style={{ color: '#305F72', opacity: 0.6 }}>
                      Estimated time: {template.estimatedTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Prompt Preview */}
              <div className="bg-white rounded-lg p-4 mb-4 border" style={{ borderColor: '#F0B7A4' }}>
                <div className="text-xs mb-2 font-medium" style={{ color: '#305F72' }}>PROMPT TEMPLATE</div>
                <div className="text-sm font-mono bg-white p-3 rounded border max-h-32 overflow-y-auto" style={{ color: '#305F72', borderColor: '#F0B7A4' }}>
                  {template.prompt.substring(0, 200)}...
                </div>
              </div>

              {/* Example */}
              {template.example && (
                <div className="bg-white rounded-lg p-3 mb-4 border" style={{ borderColor: '#568EA6' }}>
                  <div className="text-xs mb-1 font-medium" style={{ color: '#568EA6' }}>EXAMPLE USAGE</div>
                  <div className="text-sm font-mono" style={{ color: '#305F72' }}>
                    {template.example}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded capitalize" style={{ backgroundColor: '#F0B7A4', color: '#305F72' }}>
                  {template.category}
                </span>
                <button
                  onClick={() => copyToClipboard(template.prompt, template.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${copiedPrompt === template.id ? 'text-white' : 'text-white'
                    }`}
                  style={{
                    backgroundColor: copiedPrompt === template.id ? '#10b981' : '#568EA6'
                  }}
                >
                  <FaCopy className="w-4 h-4" />
                  {copiedPrompt === template.id ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Instructions */}
      <div className="rounded-xl p-6 border" style={{ background: 'linear-gradient(to right, #F0B7A4, #F0F4F8)', borderColor: '#F0B7A4' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#305F72' }}>
          <FaRocket style={{ color: '#568EA6' }} />
          Updated Implementation Guide
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm" style={{ color: '#305F72' }}>
          <div>
            <h4 className="font-medium mb-2" style={{ color: '#305F72' }}>1. Standardized Output</h4>
            <p style={{ opacity: 0.8 }}>All prompts now generate quizzes in the exact same JSON format with "title" and "questions" arrays, ensuring consistency across all quiz types.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: '#305F72' }}>2. Zero-Based Indexing</h4>
            <p style={{ opacity: 0.8 }}>The "correct" field uses zero-based indexing (0=first option, 1=second option, etc.) for technical compatibility and ease of processing.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: '#305F72' }}>3. Customize Parameters</h4>
            <p style={{ opacity: 0.8 }}>Replace all bracketed placeholders with your specific information. The AI will generate content that fits the standardized format.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: '#305F72' }}>4. Validate and Test</h4>
            <p style={{ opacity: 0.8 }}>Always verify the generated JSON is valid and test your quizzes before deployment. The standardized format makes integration easier.</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border" style={{ borderColor: '#F0B7A4' }}>
          <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: '#305F72' }}>
            <FaBrain style={{ color: '#568EA6' }} />
            JSON Format Benefits
          </h4>
          <ul className="text-sm space-y-1" style={{ color: '#305F72', opacity: 0.8 }}>
            <li>• <strong>Consistent Structure:</strong> All quizzes follow the same format for easy parsing</li>
            <li>• <strong>Technical Integration:</strong> Standardized format works with quiz platforms and LMS systems</li>
            <li>• <strong>Automated Processing:</strong> Enables batch processing and automated quiz generation</li>
            <li>• <strong>Quality Assurance:</strong> Easier to validate and check for formatting errors</li>
            <li>• <strong>Scalability:</strong> Perfect for generating multiple quizzes with consistent structure</li>
          </ul>
        </div>
      </div>
    </div>
  );
};