'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Mail, 
  Clock, 
  RefreshCw, 
  Twitter, 
  MessageCircle, 
  Activity,
  Zap,
  Send,
  Loader2,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

// Data
const twitterInfluencers = [
  { name: 'Elon Musk', handle: '@elonmusk', role: 'CEO of Tesla/SpaceX/xAI', platform: 'Twitter' },
  { name: 'Sam Altman', handle: '@sama', role: 'CEO of OpenAI', platform: 'Twitter' },
  { name: 'Andrej Karpathy', handle: '@karpathy', role: 'AI Researcher', platform: 'Twitter' },
  { name: 'Yann LeCun', handle: '@ylecun', role: 'Chief AI Scientist at Meta', platform: 'Twitter' },
  { name: 'Demis Hassabis', handle: '@demishassabis', role: 'CEO of Google DeepMind', platform: 'Twitter' },
  { name: 'Jim Fan', handle: '@DrJimFan', role: 'NVIDIA AI Scientist', platform: 'Twitter' },
  { name: 'Ashok Elluswamy', handle: '@aelluswamy', role: 'Tesla Autopilot', platform: 'Twitter' },
  { name: 'Andrew Ng', handle: '@AndrewYNg', role: 'Founder of DeepLearning.AI', platform: 'Twitter' },
  { name: 'Fei-Fei Li', handle: '@drfeifei', role: 'Co-Director Stanford HAI', platform: 'Twitter' },
  { name: 'Ilya Sutskever', handle: '@ilyasut', role: 'Co-founder of SSI', platform: 'Twitter' },
  { name: 'François Chollet', handle: '@fchollet', role: 'Creator of Keras', platform: 'Twitter' },
  { name: 'Geoffrey Hinton', handle: '@geoffreyhinton', role: 'Godfather of AI', platform: 'Twitter' },
  { name: 'Mustafa Suleyman', handle: '@mustafasuleyman', role: 'CEO of Microsoft AI', platform: 'Twitter' },
  { name: 'Greg Brockman', handle: '@gdb', role: 'President of OpenAI', platform: 'Twitter' },
  { name: 'Noam Brown', handle: '@polynoamial', role: 'OpenAI Researcher', platform: 'Twitter' },
  { name: 'Thomas Wolf', handle: '@Thom_Wolf', role: 'Co-founder of Hugging Face', platform: 'Twitter' },
  { name: 'Dario Amodei', handle: '@DarioAmodei', role: 'CEO of Anthropic', platform: 'Twitter' },
  { name: 'Aravind Srinivas', handle: '@AravSrinivas', role: 'CEO of Perplexity', platform: 'Twitter' },
  { name: 'Arthur Mensch', handle: '@arthurmensch', role: 'CEO of Mistral AI', platform: 'Twitter' },
  { name: 'Alexandr Wang', handle: '@alexandr_wang', role: 'CEO of Scale AI', platform: 'Twitter' },
];

const mockActivities = [
  { id: 1, user: 'Jim Fan', action: 'Posted a thread', content: 'RLHF is hitting a wall, we need new paradigms for reasoning models...', time: '2h ago', platform: 'Twitter', url: 'https://twitter.com/DrJimFan' },
  { id: 3, user: 'Andrej Karpathy', action: 'Liked a post', content: 'A new paper on efficient transformer inference.', time: '1 day ago', platform: 'Twitter', url: 'https://twitter.com/karpathy' },
  { id: 5, user: 'Sam Altman', action: 'Retweeted', content: 'AGI is closer than we think, but safety must remain the priority.', time: '2 days ago', platform: 'Twitter', url: 'https://twitter.com/sama' },
  { id: 6, user: 'Yann LeCun', action: 'Posted', content: 'Auto-Regressive LLMs are not the path to AGI. We need objective-driven AI.', time: '2 days ago', platform: 'Twitter', url: 'https://twitter.com/ylecun' },
  { id: 8, user: 'Elon Musk', action: 'Posted a thread', content: 'Grok 2 is making significant progress in reasoning and coding.', time: '3 days ago', platform: 'Twitter', url: 'https://twitter.com/elonmusk' },
  { id: 10, user: 'Demis Hassabis', action: 'Posted', content: 'AlphaFold 3 is now available for researchers worldwide.', time: '4 days ago', platform: 'Twitter', url: 'https://twitter.com/demishassabis' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshingActivities, setIsRefreshingActivities] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [report, setReport] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities, setActivities] = useState(mockActivities);
  
  // Email state
  const [emails, setEmails] = useState<{address: string, selected: boolean}[]>([{ address: 'hfshooting@163.com', selected: true }]);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmails, setIsSavingEmails] = useState(false);

  // Load emails on mount
  useEffect(() => {
    const saved = localStorage.getItem('subscriber_emails');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmails(parsed.map((e: string) => ({ address: e, selected: true })));
        }
      } catch (e) {
        console.error('Failed to parse saved emails', e);
      }
    }
  }, []);

  const saveEmailsToDB = async (newEmailList: {address: string, selected: boolean}[]) => {
    setIsSavingEmails(true);
    try {
      const addresses = newEmailList.map(e => e.address);
      localStorage.setItem('subscriber_emails', JSON.stringify(addresses));
    } catch (error) {
      console.error('Failed to save emails to localStorage:', error);
    } finally {
      setIsSavingEmails(false);
    }
  };

  const handleAddEmail = () => {
    if (newEmail && !emails.find(e => e.address === newEmail)) {
      const newList = [...emails, { address: newEmail, selected: true }];
      setEmails(newList);
      saveEmailsToDB(newList);
      setNewEmail('');
    }
  };

  const toggleEmail = (address: string) => {
    setEmails(emails.map(e => e.address === address ? { ...e, selected: !e.selected } : e));
  };

  const removeEmail = (address: string) => {
    const newList = emails.filter(e => e.address !== address);
    setEmails(newList);
    saveEmailsToDB(newList);
  };

  const handleSendEmail = async () => {
    const selectedEmails = emails.filter(e => e.selected).map(e => e.address).join(',');
    if (!selectedEmails) {
      alert('Please select at least one email address.');
      return;
    }
    
    if (!report) {
      alert('Please generate a report first before sending.');
      return;
    }

    setIsSending(true);
    try {
      // Mock sending email
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Email sent successfully to: ' + selectedEmails + ' (Mock)');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An unexpected error occurred while sending the email.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshActivities = async () => {
    setIsRefreshingActivities(true);
    try {
      // Mock refresh by shuffling existing activities
      await new Promise(resolve => setTimeout(resolve, 1000));
      const shuffled = [...mockActivities].sort(() => 0.5 - Math.random());
      setActivities(shuffled);
    } catch (error) {
      console.error("Failed to refresh activities", error);
    } finally {
      setIsRefreshingActivities(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setReport('');
    
    try {
      // Step 1: Use Mock Data
      setLoadingStep('Loading mock data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newActivities = [...mockActivities];

      // Step 2: Generate Report with Gemini
      setLoadingStep('Analyzing data with Gemini AI...');
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `
      你是一个专业的AI行业分析师和情报Agent。
      你的任务是根据我提供的【真实抓取数据】，生成一份今日的“TwitterAI动态日报”。
      
      追踪的名单包括：
      Twitter (X): Elon Musk, Sam Altman, Andrej Karpathy, Yann LeCun, Demis Hassabis, Jim Fan, Ashok Elluswamy, Andrew Ng, Fei-Fei Li, Ilya Sutskever, François Chollet, Geoffrey Hinton, Mustafa Suleyman, Greg Brockman, Noam Brown, Thomas Wolf, Dario Amodei, Aravind Srinivas, Arthur Mensch, Alexandr Wang

      以下是真实抓取并清洗后的最新动态数据（JSON格式）：
      ${JSON.stringify(newActivities, null, 2)}

      请仔细阅读上述真实数据，并严格按照以下逻辑生成报告：
      
      【数据筛选规则】
      1. 仅仅关注这些人物关于“AI（人工智能）”以及“前沿科技”的发帖、转帖。
      2. 严格筛选掉无关的发帖（例如：日常闲聊、调侃、政治、生活琐事等）。

      【报告结构与排版要求】
      请彻底摒弃“流水账”式的按人头罗列的写法。必须以“事件/事实”为核心，突出重点。发帖人不应该作为事实的主语，而仅仅作为信息的Reference（来源参考）。
      
      请参考以下结构生成日报：

      # TwitterAI动态日报

      ## 一、[大类名称，如：核心产品动态与市场反响]
      
      1. **[提炼的核心事件标题，如：OpenAI GPT-5.4 获得突破性市场认可]**
         * **事件：** [客观描述发生了什么事实。将发帖人作为信息来源提及，例如：“Sam Altman 及多位行业领袖密集发布推文，盛赞最新模型...” 或 “据 Andrej Karpathy 发布的项目显示...”] [附上原帖链接，如：[查看原帖](url)]
         * **关键进展：** [如果有详细内容，分点展开]
           * **[子要点标题]：** [详细描述]
           * **[子要点标题]：** [详细描述]

      2. **[提炼的核心事件标题]**
         * **事件：** [客观描述事实] [查看原帖](url)
         * **关键进展：** [分点展开]

      ## 二、[大类名称，如：基础设施与产业合作]
      ...

      ## 三、[大类名称，如：技术研究前沿与范式探讨]
      ...

      ## 四、其他值得关注的动向
      * **[简短标题]：** [一句话描述事实，发帖人作为Reference] [查看原帖](url)
      * **[简短标题]：** [一句话描述事实，发帖人作为Reference] [查看原帖](url)

      **总结：** [一段话总结今日AI领域的整体趋势、核心焦点和市场情绪。]

      【事件提炼与排序逻辑】
      1. 请根据每天的实际事件内容，将这些事件动态地划分为几个大类（主题/领域），并为每个大类取一个精炼、专业的标题。
      2. 排序规则：
         - 大类排序：将最重要、最受关注的大类排在最前面。
         - 事件排序：在每个大类内部，从最重要到不重要的顺序依次排列事件。
         - 重要性判断标准：如果有多个人发帖或转发同一个事件，计算提及该事件的人数。提及人数越多的事件越重要。
         - 并列排序标准：如果提及人数相同，请使用数据中的 \`likes\`（点赞数）总和来进行排序（点赞数不需要在最终报告中显示出来）。
      
      【写作风格要求】
      - 突出重点，提炼核心价值。
      - 多一些最硬的事实陈述，少一点“行业影响”等主观推断，只需要陈列事实就好。
      - 【核心原则】不要写成“人物观点解读”，直接保留人物做了什么。发帖人仅仅是Reference，事实本身才是主语。例如，不要写“Sam Altman说GPT-5.4很好”，而要写“GPT-5.4在多项任务上表现卓越，获得Sam Altman等人的盛赞”。
      - 【重要】在每一个事实陈述的条目中（如“事件”或“动向”末尾），必须附上该动态的“参考文献”（即原帖链接）。请从提供的数据中提取 \`url\` 字段，以 Markdown 链接的形式附在段落后，例如：[查看原帖](https://...)。
      - 语言专业、精炼，内容必须准确详实，忠于原推文事实，不要过度解读。
      - 绝对不要在报告中提及具体的推送时间。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      setReport(response.text || '生成失败，请重试。');
      setActiveTab('report');
    } catch (error) {
      console.error(error);
      setReport('生成报告时发生错误。请检查 API Key 或网络连接。');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium">Tracked Profiles</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">20</div>
          <p className="text-sm text-neutral-500">20 Twitter</p>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium">Next Report</h3>
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">10:00 AM</div>
          <p className="text-sm text-neutral-500">Scheduled daily delivery</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium">Agent Status</h3>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-3xl font-bold text-white">Active</span>
          </div>
          <p className="text-sm text-neutral-500">Monitoring streams...</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Activity Stream</h2>
          <button 
            onClick={handleRefreshActivities}
            disabled={isRefreshingActivities}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshingActivities ? 'animate-spin' : ''}`} /> 
            {isRefreshingActivities ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start p-4 rounded-lg bg-neutral-950 border border-neutral-800/50">
              <div className="mt-1 mr-4">
                {activity.platform === 'Twitter' ? (
                  <div className="p-2 bg-blue-500/10 rounded-full text-blue-400">
                    <Twitter className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-2 bg-orange-500/10 rounded-full text-orange-400">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-200">{activity.user}</span>
                  <span className="text-xs text-neutral-500">{activity.time}</span>
                </div>
                <div className="text-sm text-neutral-400 mb-2">{activity.action}</div>
                <p className="text-neutral-300 text-sm leading-relaxed mb-2">&quot;{activity.content}&quot;</p>
                <a 
                  href={activity.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View original post
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderProfiles = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <div className="flex items-center mb-6">
          <Twitter className="w-6 h-6 text-blue-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Twitter (X) Top 20</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {twitterInfluencers.map((profile, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full font-medium">
                  Tracking
                </div>
              </div>
              <h3 className="font-semibold text-white text-lg">{profile.name}</h3>
              <p className="text-blue-400 text-sm mb-2">{profile.handle}</p>
              <p className="text-neutral-500 text-sm">{profile.role}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderReport = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Daily Digest Generator</h2>
          <p className="text-neutral-400 text-sm">
            Manually trigger the agent to compile the latest insights from the 20 tracked profiles.
          </p>
        </div>
        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className="mt-4 sm:mt-0 flex items-center justify-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {loadingStep || 'Compiling...'}
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Generate Now
            </>
          )}
        </button>
      </div>

      {report ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">AI Influencer Daily Digest</h1>
              <p className="text-neutral-500 text-sm">Generated on {currentTime.toLocaleDateString()} at {currentTime.toLocaleTimeString()}</p>
            </div>
            <button 
              onClick={handleSendEmail}
              disabled={isSending || !report}
              className="flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSending ? 'Sending...' : 'Send to Email'}
            </button>
          </div>
          <div className="markdown-body">
            <Markdown
              components={{
                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" />
              }}
            >
              {report}
            </Markdown>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-neutral-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No Report Generated Yet</h3>
          <p className="text-neutral-500 max-w-md">
            Click the &quot;Generate Now&quot; button above to simulate the daily agent run and compile insights from the tracked profiles.
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-6"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Delivery Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Recipient Emails
            </label>
            <div className="space-y-2 mb-3">
              {emails.map((email, idx) => (
                <div key={idx} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={email.selected}
                      onChange={() => toggleEmail(email.address)}
                      className="w-4 h-4 text-blue-500 bg-neutral-900 border-neutral-700 rounded focus:ring-blue-500 mr-3"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="text-white text-sm">{email.address}</span>
                  </div>
                  <button onClick={() => removeEmail(email.address)} className="text-neutral-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2">
                <Plus className="w-4 h-4 text-neutral-500 mr-2" />
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Add new email address..."
                  className="bg-transparent border-none outline-none text-white w-full text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                />
              </div>
              <button 
                onClick={handleAddEmail}
                disabled={isSavingEmails}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isSavingEmails ? 'Saving...' : 'Add'}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Select the addresses that should receive the daily digest.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Delivery Time
            </label>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3">
              <Clock className="w-5 h-5 text-neutral-500 mr-3" />
              <input 
                type="time" 
                value="10:00" 
                readOnly
                className="bg-transparent border-none outline-none text-white w-full"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Agent will compile and send the report at this time daily.</p>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Agent Status</h4>
                <p className="text-sm text-neutral-500">Enable or disable the daily automated run.</p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle" checked readOnly className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-green-500 right-0" style={{ right: 0, borderColor: '#22c55e' }}/>
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-green-500 cursor-pointer"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profiles', label: 'Tracked Profiles', icon: Users },
    { id: 'report', label: 'Report Preview', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-neutral-950 border-r border-neutral-800 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-white tracking-tight">AI Tracker Agent</span>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-neutral-800 text-white font-medium' 
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-neutral-800 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-sm text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
              <Mail className="w-4 h-4 mr-2" />
              hfshooting@163.com
            </div>
          </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'profiles' && renderProfiles()}
          {activeTab === 'report' && renderReport()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
}
