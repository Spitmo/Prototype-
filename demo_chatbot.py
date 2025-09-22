import torch
import pickle
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification
from datetime import datetime
import json

class EnhancedDemoChatbot:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        self.load_models()
        self.conversation_history = []

    def load_models(self):
        """Load both models with proper error handling"""
        try:
            # Load Mental Health Model
            mental_path = r"C:\Users\NAMAN\Documents\GitHub\Prototype-\trained_mental_health_bert_improved"
            print("Loading mental health model...")
            self.mental_health_model = BertForSequenceClassification.from_pretrained(mental_path)
            self.mental_health_tokenizer = BertTokenizer.from_pretrained(mental_path)
            with open(f"{mental_path}/label_encoder.pkl", "rb") as f:
                self.mental_health_encoder = pickle.load(f)
            print(f"✅ Mental health model loaded: {len(self.mental_health_encoder.classes_)} classes")

            # Load Dialogue Act Model (check multiple paths)
            dialogue_paths = [
                r"C:\Users\NAMAN\Documents\GitHub\Prototype-\trained_dialogue_bert_improved",
                r"C:\Users\NAMAN\Documents\GitHub\Prototype-\trained_dialogue_bert_fast"
            ]
            dialogue_loaded = False
            for dialogue_path in dialogue_paths:
                try:
                    print(f"Trying to load dialogue model from: {dialogue_path}")
                    self.dialogue_model = BertForSequenceClassification.from_pretrained(dialogue_path)
                    self.dialogue_tokenizer = BertTokenizer.from_pretrained(dialogue_path)
                    with open(f"{dialogue_path}/label_encoder.pkl", "rb") as f:
                        self.dialogue_encoder = pickle.load(f)
                    print(f"✅ Dialogue model loaded: {len(self.dialogue_encoder.classes_)} classes")
                    dialogue_loaded = True
                    break
                except Exception as e:
                    print(f"❌ Could not load from {dialogue_path}: {e}")
            if not dialogue_loaded:
                raise Exception("Could not load dialogue model from any path")

            # Move models to device and eval mode
            self.mental_health_model.to(self.device).eval()
            self.dialogue_model.to(self.device).eval()
            print("✅ All models loaded and ready for demo!")

        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise

    def analyze_message(self, text, include_detailed_analysis=True):
        """Analyze single message with both models"""
        if not text or not text.strip():
            return {'error': 'Empty message', 'message': text}
        text = text.strip()
        try:
            # Mental Health
            mental_inputs = self.mental_health_tokenizer(
                text, truncation=True, padding='max_length',
                max_length=64, return_tensors='pt'
            )
            mental_inputs = {k: v.to(self.device) for k, v in mental_inputs.items()}
            with torch.no_grad():
                mental_outputs = self.mental_health_model(**mental_inputs)
                mental_probs = torch.nn.functional.softmax(mental_outputs.logits, dim=-1)[0]
                mental_class = torch.argmax(mental_probs, dim=-1).item()
                mental_conf = mental_probs[mental_class].item()
                top3_mental = torch.topk(mental_probs, 3)
                mental_top3 = [
                    {'state': self.mental_health_encoder.inverse_transform([idx.item()])[0],
                     'confidence': prob.item()}
                    for idx, prob in zip(top3_mental.indices, top3_mental.values)
                ]
            mental_state = self.mental_health_encoder.inverse_transform([mental_class])[0]

            # Dialogue Act
            enhanced_text = f"[DIALOG] {text} [/DIALOG]"
            dialogue_inputs = self.dialogue_tokenizer(
                enhanced_text, truncation=True, padding='max_length',
                max_length=96, return_tensors='pt'
            )
            dialogue_inputs = {k: v.to(self.device) for k, v in dialogue_inputs.items()}
            with torch.no_grad():
                dialogue_outputs = self.dialogue_model(**dialogue_inputs)
                dialogue_probs = torch.nn.functional.softmax(dialogue_outputs.logits, dim=-1)[0]
                dialogue_class = torch.argmax(dialogue_probs, dim=-1).item()
                dialogue_conf = dialogue_probs[dialogue_class].item()
                top3_dialogue = torch.topk(dialogue_probs, 3)
                dialogue_top3 = [
                    {'act': self.dialogue_encoder.inverse_transform([idx.item()])[0],
                     'confidence': prob.item()}
                    for idx, prob in zip(top3_dialogue.indices, top3_dialogue.values)
                ]
            dialogue_act = self.dialogue_encoder.inverse_transform([dialogue_class])[0]

            # Risk Assessment
            high_risk = ['Suicidal', 'Depression']
            medium_risk = ['Anxiety', 'Stress', 'Bipolar', 'Personality disorder']
            risk_level = 'low'
            if mental_state in high_risk: risk_level = 'high'
            elif mental_state in medium_risk: risk_level = 'medium'

            result = {
                'message': text,
                'timestamp': datetime.now().isoformat(),
                'mental_health': {
                    'state': mental_state,
                    'confidence': mental_conf,
                    'risk_level': risk_level,
                    'needs_attention': mental_state in high_risk + medium_risk,
                    'crisis_alert': mental_state == 'Suicidal' and mental_conf > 0.7
                },
                'dialogue_act': {
                    'act': dialogue_act,
                    'confidence': dialogue_conf,
                    'category': self._categorize_dialogue_act(dialogue_act)
                },
                'overall_assessment': {
                    'mental_health_confidence': 'high' if mental_conf > 0.8 else 'medium' if mental_conf > 0.5 else 'low',
                    'dialogue_confidence': 'high' if dialogue_conf > 0.8 else 'medium' if dialogue_conf > 0.5 else 'low'
                }
            }
            if include_detailed_analysis:
                result['detailed_analysis'] = {
                    'mental_health_top3': mental_top3,
                    'dialogue_act_top3': dialogue_top3,
                    'input_length': len(text.split()),
                    'model_versions': {'mental_health': 'improved_v1', 'dialogue_act': 'available_version'}
                }
            self.conversation_history.append(result)
            return result
        except Exception as e:
            return {'error': str(e), 'message': text, 'timestamp': datetime.now().isoformat()}

    def _categorize_dialogue_act(self, act):
        a = str(act).lower()
        if 'question' in a or 'request' in a: return 'inquiry'
        if 'inform' in a or 'statement' in a: return 'information'
        if 'response' in a or 'answer' in a: return 'response'
        if 'greeting' in a or 'hello' in a: return 'greeting'
        if 'thank' in a or 'appreciation' in a: return 'gratitude'
        return 'other'

    def run_demo_conversation(self, demo_messages=None):
        if demo_messages is None:
            demo_messages = [
                "Hello! How can you help me?",
                "I've been feeling really anxious lately about work and life",
                "Thank you so much for listening to me",
                "I don't know what to do anymore, everything seems hopeless",
                "Can you recommend some coping strategies for stress?",
                "That was very helpful, I really appreciate your support"
            ]
        print("\n🎭 ENHANCED CHATBOT DEMO - LIVE ANALYSIS")
        results = []
        for i, msg in enumerate(demo_messages, 1):
            print(f"\n[Message {i}] User: \"{msg}\"")
            res = self.analyze_message(msg, True)
            if 'error' in res:
                print(f"❌ {res['error']}")
                continue
            results.append(res)
            mh, da = res['mental_health'], res['dialogue_act']
            print(f"🧠 Mental Health: {mh['state']} ({mh['confidence']:.3f}) - {mh['risk_level'].upper()} risk")
            print(f"💬 Dialogue Act: {da['act']} ({da['confidence']:.3f}) - {da['category']}")
            if mh['crisis_alert']: print("🚨 CRISIS ALERT!")
            elif mh['needs_attention']: print("⚠️ Needs Attention")
        return results

    def analyze_single_message_demo(self, message):
        print(f"\n🔍 Analyzing: {message}")
        return self.analyze_message(message, True)

    def export_demo_results(self, filename="demo_results.json"):
        with open(filename, 'w') as f:
            json.dump(self.conversation_history, f, indent=2, default=str)
        print(f"✅ Results exported to {filename}")

# Utility functions
def quick_model_test():
    print("\n⚡ QUICK MODEL TEST")
    chatbot = EnhancedDemoChatbot()
    res = chatbot.analyze_message("Hello, I need some help", False)
    if 'error' not in res:
        print(f"✅ Mental Health: {res['mental_health']['state']} | Dialogue: {res['dialogue_act']['act']}")
    else:
        print(f"❌ Test failed: {res['error']}")

def presentation_stats():
    print("\n📊 PRESENTATION STATS")
    chatbot = EnhancedDemoChatbot()
    print(f"✅ Mental Health Classes: {len(chatbot.mental_health_encoder.classes_)}")
    print(f"✅ Dialogue Act Classes: {len(chatbot.dialogue_encoder.classes_)}")

# MAIN
if __name__ == "__main__":
    print("🚀 Starting Full Demo")
    chatbot = EnhancedDemoChatbot()
    chatbot.run_demo_conversation()
    chatbot.analyze_single_message_demo("I'm thinking about ending it all, nothing matters anymore")
    chatbot.export_demo_results("final_demo_results.json")
    quick_model_test()
    presentation_stats()
    print("\n🎉 DEMO COMPLETED SUCCESSFULLY!")
