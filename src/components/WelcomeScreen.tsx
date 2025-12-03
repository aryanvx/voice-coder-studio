import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Code, Zap, Brain, Play } from "lucide-react";
import AnimatedList from "@/components/AnimatedList";

interface WelcomeScreenProps {
	onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
	const [isDemo, setIsDemo] = useState(false);

	const featureLists = [
		{
			icon: <Mic className="w-6 h-6" />,
			title: "Voice Commands",
			items: [
				"Create functions with natural language",
				"Write code by speaking naturally",
				"No keyboard typing required",
				"Supports multiple programming languages"
			]
		},
		{
			icon: <Code className="w-6 h-6" />,
			title: "Smart Code Generation",
			items: [
				"AI understands context and intent",
				"Follows your coding style",
				"Generates complete implementations",
				"Smart and strict modes available"
			]
		},
		{
			icon: <Brain className="w-6 h-6" />,
			title: "Adaptive Learning",
			items: [
				"Learns your naming conventions",
				"Remembers frequently used libraries",
				"Adapts to your coding patterns",
				"Improves suggestions over time"
			]
		},
		{
			icon: <Zap className="w-6 h-6" />,
			title: "Voice Navigation",
			items: [
				"Jump to any line instantly",
				"Open files with voice commands",
				"Navigate through your codebase",
				"Hands-free file management"
			]
		}
	];

	const voiceCommands = [
		'"Create a function called calculateTotal"',
		'"Go to line 15"',
		'"Add error handling to this function"',
		'"Import numpy as np"',
		'"Fix the indentation on line 8"',
		'"Open the utils.py file"'
	];

	const startDemo = () => {
		setIsDemo(true);
		setTimeout(() => {
			onStart();
		}, 2000);
	};

	return (
		<div className="bg-background py-12 px-6" style={{ minHeight: '150vh' }}>
			<div className="max-w-4xl w-full mx-auto pb-24">
				<div className="text-center mb-12">
					<div className="flex items-center justify-center gap-3 mb-6">
						<div className="w-4 h-4 bg-gradient-voice rounded-full animate-pulse-glow"></div>
						<h1 className="text-5xl font-bold bg-gradient-voice bg-clip-text text-transparent">
							VoiceCode
						</h1>
						<div className="w-4 h-4 bg-gradient-voice rounded-full animate-pulse-glow"></div>
					</div>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						The future of coding is here. Write, debug, and navigate code entirely through voice commands. 
						No keyboard, no mouse—just your voice and the power of AI.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Button 
							onClick={startDemo}
							size="lg" 
							className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-3"
							disabled={isDemo}
						>
							{isDemo ? (
								<>
									<div className="animate-spin mr-2">
										<Zap className="w-5 h-5" />
									</div>
									Initializing...
								</>
							) : (
								<>
									<Play className="w-5 h-5" />
									Start Coding with Voice
								</>
							)}
						</Button>
						<Badge variant="secondary" className="px-4 py-2">
							🎤 Microphone access required
						</Badge>
					</div>
				</div>
				<div className="grid md:grid-cols-2 gap-6 mb-12">
					{featureLists.map((feature, index) => (
						<div key={index} className="bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all duration-300 rounded-lg p-6">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
									{feature.icon}
								</div>
								<h3 className="font-semibold text-lg">{feature.title}</h3>
							</div>
							<AnimatedList
								items={feature.items}
								showGradients={false}
								enableArrowNavigation={false}
								displayScrollbar={false}
								className="feature-list"
							/>
						</div>
					))}
				</div>
				<div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg p-6 mb-12">
					<h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
						<Mic className="w-5 h-5 text-primary" />
						Try these voice commands:
					</h3>
					<AnimatedList
						items={voiceCommands}
						showGradients={true}
						enableArrowNavigation={true}
						displayScrollbar={true}
						className="commands-list"
					/>
				</div>
				<div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
					© 2025 Aryan Vyahalkar • <a href="https://github.com/aryanvx/voice-coder-studio" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline transition-colors">GitHub</a> • MIT License
				</div>
			</div>
		</div>
	);
}