import type { Lang } from "@/lib/taxonomySlug";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  updatedAt: string;
  summary: string;
  sections: LegalSection[];
};

const termsZh: LegalDocument = {
  title: "龟迹用户协议",
  updatedAt: "2026年7月16日",
  summary:
    "本协议适用于龟迹（CheloniaTrace）App、网站及相关服务。请在注册或使用前仔细阅读，尤其是责任限制、智能设备控制和账号注销条款。",
  sections: [
    {
      title: "一、协议的确认与适用",
      paragraphs: [
        "当您勾选同意、注册、登录或实际使用龟迹服务，即表示您已阅读、理解并同意本协议及《龟迹隐私政策》。如您不同意，请停止注册或使用需要账号的服务。",
        "龟迹可能根据法律法规、服务功能或安全要求更新本协议。重大变更将通过 App、网站或其他合理方式提示，并在法律要求时重新征得同意。",
      ],
    },
    {
      title: "二、账号注册与安全",
      bullets: [
        "您可使用手机验证码以及龟迹届时提供的其他方式注册或登录。",
        "您应提供真实、合法、有效的信息，不得冒用他人身份或以违法目的注册账号。",
        "您应妥善保管设备、验证码和登录状态。发现账号异常时，请及时通过 App 内“我的—意见反馈”联系我们。",
        "因设备丢失、验证码泄露或您主动授权他人操作造成的损失，由责任方依法承担。",
      ],
    },
    {
      title: "三、服务内容",
      bullets: [
        "宠物、龟缸、设备、喂食、健康和环境记录的创建、同步与管理。",
        "基于您输入的数据、规则模型、天气和研究资料生成喂食或环境参考信息。",
        "龟类分类、研究来源、饲养资料和工具展示。",
        "在您主动绑定后，连接米家设备并展示状态、传感器读数或发送控制指令。",
        "意见反馈、通知提醒以及龟迹后续依法提供的其他功能。",
      ],
    },
    {
      title: "四、用户内容与使用规范",
      paragraphs: [
        "您对自行填写或上传的文字、图片、设备名称及记录内容负责，并保证拥有相应权利。您授予龟迹为提供同步、展示、备份和故障处理服务所必要的、非独占的使用权限。",
      ],
      bullets: [
        "不得上传违法、有害、侵权、欺诈或含有恶意代码的内容。",
        "不得攻击、干扰、逆向破坏服务，绕过权限、频率限制或访问他人工作区、账号和设备。",
        "不得利用龟迹实施非法交易、虐待动物、侵犯他人隐私或其他违法活动。",
      ],
    },
    {
      title: "五、养护与健康信息特别说明",
      paragraphs: [
        "龟迹提供的喂食、冬眠、温度、健康风险及其他内容仅供日常记录和一般性参考，不构成兽医诊断、处方或紧急处置意见，也不能替代合格兽医的现场检查。",
        "物种差异、个体健康、环境设备和数据误差都可能影响结果。如宠物出现拒食、外伤、呼吸异常、严重脱水或其他紧急情况，请立即停止依赖自动建议并咨询专业兽医。",
      ],
    },
    {
      title: "六、智能设备控制特别说明",
      paragraphs: [
        "智能设备功能依赖您的米家账号、家庭网络、设备在线状态和第三方平台。控制结果可能因网络延迟、设备故障、第三方接口变化或断电而失败。",
        "您应为加热、照明、过滤等关键设备设置独立的物理保护、温控保护和人工巡检机制，不应将龟迹作为唯一安全控制手段。进行远程控制前，请确认操作不会对宠物、人员或财产造成风险。",
      ],
    },
    {
      title: "七、服务变更、中断与终止",
      paragraphs: [
        "我们可能因维护、升级、安全事件、第三方服务变化或不可抗力暂停部分功能，并将尽合理努力减少影响。免费测试功能、实验性功能和尚未正式开放的 AI 功能可能随时调整或停止。",
        "如您严重违反本协议、危害系统安全或侵害他人权益，我们可依法限制或终止相关服务，并保留必要证据。",
      ],
    },
    {
      title: "八、知识产权",
      paragraphs: [
        "龟迹的软件、界面、标识、数据库结构、规则模型及原创内容的知识产权归相应权利人所有。研究文献、物种资料和第三方商标仍归原权利人所有，引用信息以页面标注的来源和许可为准。",
      ],
    },
    {
      title: "九、账号注销与数据处理",
      paragraphs: [
        "您可以删除部分宠物、记录、设备绑定或米家账号。若需注销龟迹账号，可通过 App 内“我的—意见反馈”提交“注销账号”申请；我们将在核验账号归属后处理，并删除或匿名化法律法规不要求继续保存的数据。",
        "注销前请处理尚未同步的本地数据。注销不会自动取消由 Apple 或其他第三方管理的订阅或服务。",
      ],
    },
    {
      title: "十、责任限制",
      paragraphs: [
        "在法律允许范围内，龟迹不对因用户输入错误、第三方平台故障、网络中断、设备自身缺陷、未遵守安全提示或将参考信息当作专业诊疗意见造成的损失承担超出法定范围的责任。本条不排除依法不能限制或免除的责任。",
      ],
    },
    {
      title: "十一、未成年人",
      paragraphs: [
        "未满十四周岁的未成年人应在监护人同意和指导下使用。监护人应帮助未成年人理解本协议和隐私政策，并对其使用行为负责。",
      ],
    },
    {
      title: "十二、法律适用与争议解决",
      paragraphs: [
        "本协议适用中华人民共和国法律。发生争议时，双方应先友好协商；协商不成的，可向有管辖权的人民法院提起诉讼。",
      ],
    },
    {
      title: "十三、联系我们",
      paragraphs: [
        "如对本协议有疑问、建议或投诉，请通过龟迹 App 内“我的—意见反馈”联系我们。我们会在核实相关信息后处理。",
      ],
    },
  ],
};

const privacyZh: LegalDocument = {
  title: "龟迹隐私政策",
  updatedAt: "2026年7月16日",
  summary:
    "本政策说明龟迹收集哪些信息、为何处理、与谁共享、保存在哪里，以及您如何访问、更正、删除或撤回授权。",
  sections: [
    {
      title: "一、我们是谁及如何联系",
      paragraphs: [
        "龟迹（CheloniaTrace）开发者及运营者是本服务相关个人信息的处理者。您可通过 App 内“我的—意见反馈”就个人信息访问、更正、删除、撤回同意、账号注销或投诉提出请求。",
      ],
    },
    {
      title: "二、我们处理的个人信息",
      bullets: [
        "账号与身份信息：手机号码、短信验证码验证结果；使用 Apple 登录时的 Apple 用户标识，以及您选择提供的邮箱或昵称。",
        "档案与养护数据：昵称、宠物名称、物种、出生或到家日期、性别、体重、背甲长度、健康与喂食记录；龟缸位置模式、环境参数；设备名称、类型、运行和绑定信息；喂食策略及执行状态。",
        "位置信息：在您授权后获取设备位置或您手动填写的坐标，用于天气查询、环境展示和温度归一化。精确位置信息属于敏感个人信息，我们仅在对应功能需要时处理。",
        "设备与运行信息：随机设备标识、系统版本、App 版本、时区、推送令牌、网络错误和有限的功能使用事件，用于登录安全、同步、通知、故障排查和服务改进。",
        "照片与反馈：仅在您主动选择时读取所选照片；反馈内容、所选附件、App 版本和设备摘要会发送至服务器供问题处理。",
        "智能家居信息：在您主动绑定米家后，处理米家账号标识、加密保存的授权凭据、设备列表、在线状态、传感器读数、控制指令和必要的操作记录。",
        "网站预约信息：当您主动提交预约时，处理您填写的手机号、邮箱、微信号或其他联系方式及备注。",
      ],
    },
    {
      title: "三、设备权限",
      bullets: [
        "定位：用于天气和环境功能；拒绝后仍可使用宠物记录等基本功能，并可手动填写环境信息。",
        "照片：通过系统照片选择器读取您明确选中的图片，不会自动扫描完整相册。",
        "通知：用于喂食提醒、策略提醒和设备预警；您可随时在 iOS 系统设置中关闭。",
        "网络：用于登录、数据同步、天气、资料和智能设备服务。",
      ],
    },
    {
      title: "四、处理目的和原则",
      paragraphs: [
        "我们遵循合法、正当、必要和诚信原则，仅为账号认证、跨设备同步、养护记录、天气与策略计算、智能设备控制、通知、反馈、安全防护和依法履责处理信息。",
        "对于非基本功能所需的信息，我们会通过系统权限、功能开关或单独提示取得您的选择；拒绝非必要信息不会影响不依赖该信息的基本功能。",
      ],
    },
    {
      title: "五、第三方服务",
      bullets: [
        "阿里云短信：接收手机号和验证码发送所必需的信息，用于手机号验证。",
        "Apple：在启用时提供 Sign in with Apple 和 APNs 推送；处理范围受 Apple 规则和您的系统设置约束。",
        "小米/米家：仅在您主动绑定后处理授权登录、设备同步、状态查询和控制指令。",
        "Open-Meteo：接收查询天气所需的经纬度，不向其提供您的龟迹账号、手机号或宠物档案。",
        "云基础设施与网络服务商：用于服务器托管、数据库、缓存、备份、域名解析和安全防护。",
      ],
      paragraphs: [
        "我们要求接收个人信息的服务提供方仅按约定目的处理并采取不低于本政策所述的保护措施。AI 功能当前未开放；未来如启用并需要向新的模型服务商提供数据，我们将更新说明并在必要时另行征得同意。",
      ],
    },
    {
      title: "六、共享、转让与公开披露",
      paragraphs: [
        "除实现上述功能、获得您的明确授权、履行法定义务、保护生命健康或重大财产安全所必需外，我们不会出售或向无关第三方提供您的个人信息。",
        "如发生合并、分立、资产转让或运营主体变更，我们将依法告知接收方，并要求其继续受本政策约束；处理目的发生变化时，将重新取得您的同意。",
      ],
    },
    {
      title: "七、存储地点、跨境处理与保存期限",
      paragraphs: [
        "龟迹当前主要业务服务器部署在新加坡，因此您的账号、同步档案、反馈和智能设备相关信息可能在中华人民共和国境外存储和处理。境外接收方为龟迹所使用的云基础设施及必要服务提供商，处理目的和信息类型以本政策所列内容为限。",
        "我们将在法律要求时就个人信息出境、敏感个人信息处理等事项取得单独同意并履行相应合规义务。您可选择不注册或不使用需要云端同步的功能；仅保存在设备本地且未提交或同步的信息不会上传。",
        "我们仅在实现目的所需期限内保存信息。账号注销并完成核验后，法律法规不要求保留的数据将从在线系统删除或匿名化；备份数据通常随最长三十日的轮转周期清除。安全审计或依法必须保存的信息将在法定期限届满后处理。",
      ],
    },
    {
      title: "八、信息安全",
      paragraphs: [
        "我们采取 HTTPS 传输、访问控制、工作区隔离、凭据加密、密钥分离、日志脱敏、备份验证、容器最小权限和安全审计等措施。米家授权凭据以专用密钥加密保存。",
        "互联网服务不存在绝对安全。发生可能影响您权益的安全事件时，我们将依法采取补救措施并通过合理方式告知。",
      ],
    },
    {
      title: "九、您的权利",
      bullets: [
        "访问和更正：在 App 中查看或修改账号昵称、宠物、龟缸、设备和记录。",
        "删除：删除具体记录、解除设备绑定或米家账号；账号注销可通过“我的—意见反馈”提出。",
        "撤回同意：在 iOS 设置中关闭定位、照片或通知权限，或停止使用对应功能。撤回不影响此前基于同意完成的处理。",
        "复制、解释和投诉：通过意见反馈提出申请，我们会在核验身份后依法处理。",
      ],
    },
    {
      title: "十、未成年人信息",
      paragraphs: [
        "龟迹不以未满十四周岁的未成年人为主要服务对象。未成年人应在监护人同意和指导下使用；如发现未经监护人同意处理了未成年人信息，请联系我们删除或采取其他措施。",
      ],
    },
    {
      title: "十一、政策更新",
      paragraphs: [
        "功能、第三方服务、存储地点或法律要求发生变化时，我们可能更新本政策。重大变更将通过 App、网站或弹窗提示，并在依法需要时重新取得同意。",
      ],
    },
    {
      title: "十二、联系我们",
      paragraphs: [
        "请通过龟迹 App 内“我的—意见反馈”提交隐私请求，并在内容中注明“隐私请求”或“注销账号”。为保护账号安全，我们可能要求验证手机号或其他账号归属信息。",
      ],
    },
  ],
};

const termsEn: LegalDocument = {
  title: "CheloniaTrace Terms of Service",
  updatedAt: "July 16, 2026",
  summary:
    "These terms govern your use of the CheloniaTrace app, website, pet-care records, reference tools, and optional smart-home integrations.",
  sections: [
    {
      title: "1. Acceptance",
      paragraphs: [
        "By registering, signing in, or using an account-based feature, you agree to these Terms and the Privacy Policy. Stop using the service if you do not agree.",
      ],
    },
    {
      title: "2. Accounts",
      bullets: [
        "Provide lawful and accurate registration information.",
        "Protect your device, verification codes, and signed-in session.",
        "Report suspected unauthorized access through in-app Feedback.",
      ],
    },
    {
      title: "3. Service scope",
      paragraphs: [
        "CheloniaTrace provides pet, enclosure, equipment, feeding and health records; reference calculations; taxonomy and research pages; notifications; feedback; and optional Mijia device integration.",
      ],
    },
    {
      title: "4. Acceptable use",
      paragraphs: [
        "Do not upload unlawful or infringing content, interfere with security controls, access another workspace, abuse rate limits, or use the service to harm animals or other people.",
      ],
    },
    {
      title: "5. Veterinary disclaimer",
      paragraphs: [
        "Care suggestions and risk indicators are general references, not veterinary diagnosis, prescriptions, or emergency advice. Seek a qualified veterinarian when an animal is ill or injured.",
      ],
    },
    {
      title: "6. Smart-device safety",
      paragraphs: [
        "Remote controls depend on third-party platforms, networks, and hardware. Maintain physical safeguards, independent temperature controls, and manual inspection for critical equipment.",
      ],
    },
    {
      title: "7. Availability and changes",
      paragraphs: [
        "Features may change or be suspended for maintenance, security, third-party changes, or force majeure. Experimental and unreleased AI functionality may remain unavailable.",
      ],
    },
    {
      title: "8. Account deletion",
      paragraphs: [
        "You may delete individual records and unlink devices. To request full account deletion, submit an in-app Feedback request titled “Delete account.” Data not legally required will be deleted or de-identified after account verification.",
      ],
    },
    {
      title: "9. Liability and disputes",
      paragraphs: [
        "Liability is limited only to the extent permitted by applicable law. These Terms are governed by the laws of the People’s Republic of China, and disputes should first be resolved through good-faith consultation.",
      ],
    },
    {
      title: "10. Contact",
      paragraphs: ["Contact us through Profile → Feedback in the CheloniaTrace app."],
    },
  ],
};

const privacyEn: LegalDocument = {
  title: "CheloniaTrace Privacy Policy",
  updatedAt: "July 16, 2026",
  summary:
    "This policy explains what data CheloniaTrace processes, why it is needed, where it is stored, and how you can exercise your privacy rights.",
  sections: [
    {
      title: "1. Data we process",
      bullets: [
        "Account data such as phone number, verification status, Apple user identifier, optional email, and nickname.",
        "Pet, enclosure, equipment, feeding, health, environmental, and strategy records you create.",
        "Location or manually entered coordinates for weather and environmental features, with permission.",
        "Random device ID, OS and app version, time zone, push token, limited telemetry, and error information.",
        "Feedback text, selected attachments, and device summaries you choose to submit.",
        "Encrypted Mijia authorization credentials, device state, sensor readings, and control records when you link Mijia.",
      ],
    },
    {
      title: "2. Purposes",
      paragraphs: [
        "We use this data for authentication, synchronization, pet-care records, weather and reference calculations, notifications, smart-device control, support, security, and legal compliance.",
      ],
    },
    {
      title: "3. Service providers",
      paragraphs: [
        "Necessary providers may include Alibaba Cloud SMS, Apple, Xiaomi/Mijia, Open-Meteo, and cloud hosting or security providers. They receive only the data needed for their service and must protect it appropriately.",
      ],
    },
    {
      title: "4. International processing",
      paragraphs: [
        "Our primary server is currently hosted in Singapore. Account, synchronized care records, feedback, and smart-home data may therefore be stored or processed outside mainland China. We will provide required notices and obtain separate consent where applicable.",
      ],
    },
    {
      title: "5. Retention and security",
      paragraphs: [
        "We retain data only as long as necessary. After verified account deletion, data not legally required is deleted or de-identified; rotating backups are normally removed within 30 days. We use HTTPS, access controls, workspace isolation, encryption, audit logs, and verified backups.",
      ],
    },
    {
      title: "6. Your rights",
      paragraphs: [
        "You may access, correct, delete, or request a copy of your information, withdraw system permissions, unlink Mijia, or request account deletion through Profile → Feedback.",
      ],
    },
    {
      title: "7. Children and updates",
      paragraphs: [
        "Children under 14 should use the service only with guardian consent and supervision. Material policy changes will be announced in the app or website and renewed consent will be requested when required.",
      ],
    },
    {
      title: "8. Contact",
      paragraphs: ["Submit privacy questions or requests through Profile → Feedback."],
    },
  ],
};

export function getLegalDocument(kind: "terms" | "privacy", lang: Lang): LegalDocument {
  if (lang === "zh") {
    return kind === "terms" ? termsZh : privacyZh;
  }
  return kind === "terms" ? termsEn : privacyEn;
}
