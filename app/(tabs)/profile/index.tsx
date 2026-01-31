import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeArea } from '../../../src/components/SafeArea';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Modal } from '../../../src/components/ui/Modal';
import { useAuth } from '../../../src/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    signOut,
    updateProfile,
  } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editDisplayName, setEditDisplayName] = useState(
    profile?.display_name || ''
  );
  const [editBio, setEditBio] = useState(profile?.bio || '');

  const handleEmailSupport = () => {
    Linking.openURL('mailto:info@aigencytech.com?subject=Recipe Wildcard Support');
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/home');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        username: editUsername.trim() || undefined,
        display_name: editDisplayName.trim() || undefined,
        bio: editBio.trim() || undefined,
      });
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#E0FAF7', '#FFF5F4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeArea className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-secondary-100 items-center justify-center mb-6">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Join Recipe Wildcard
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Create an account to save recipes, share your creations, and more
          </Text>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push('/login')}
            className="w-full mb-3"
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => router.push('/register')}
            className="w-full"
          >
            Create Account
          </Button>
        </SafeArea>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#E0FAF7', '#FFF5F4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeArea className="flex-1" edges={['bottom']}>
        <ScrollView className="flex-1">
          <View className="px-4 pt-4">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Profile</Text>

            <Card variant="elevated" className="mb-4">
              <View className="items-center">
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    className="w-20 h-20 rounded-full mb-3"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-secondary-100 items-center justify-center mb-3">
                    <Text className="text-3xl text-secondary-700">
                      {(profile?.display_name || profile?.username || user?.email || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text className="text-xl font-bold text-gray-900">
                  {profile?.display_name || profile?.username || 'User'}
                </Text>
                {profile?.username && profile?.display_name && (
                  <Text className="text-secondary-600">@{profile.username}</Text>
                )}
                <Text className="text-gray-500 text-sm mt-1">{user?.email}</Text>
                {profile?.bio && (
                  <Text className="text-gray-600 text-center mt-3">
                    {profile.bio}
                  </Text>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setEditUsername(profile?.username || '');
                    setEditDisplayName(profile?.display_name || '');
                    setEditBio(profile?.bio || '');
                    setShowEditModal(true);
                  }}
                  className="mt-4"
                >
                  Edit Profile
                </Button>
              </View>
            </Card>

            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Settings
              </Text>

              <TouchableOpacity
                onPress={() => setShowAppearanceModal(true)}
                className="bg-white rounded-xl px-4 py-4 mb-2 flex-row items-center"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>🎨</Text>
                <Text className="text-gray-900 flex-1">Appearance</Text>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowPrivacyModal(true)}
                className="bg-white rounded-xl px-4 py-4 mb-2 flex-row items-center"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>🔒</Text>
                <Text className="text-gray-900 flex-1">Privacy</Text>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowHelpModal(true)}
                className="bg-white rounded-xl px-4 py-4 flex-row items-center"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>❓</Text>
                <Text className="text-gray-900 flex-1">Help & Support</Text>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>
            </View>

            <Button
              variant="outline"
              onPress={handleSignOut}
              className="mb-8"
            >
              Sign Out
            </Button>

            <View className="items-center pb-8">
              <Text className="text-gray-400 text-sm">Recipe Wildcard v1.0.0</Text>
            </View>
          </View>
        </ScrollView>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <View className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={editUsername}
            onChangeText={setEditUsername}
            autoCapitalize="none"
          />
          <Input
            label="Display Name"
            placeholder="Enter display name"
            value={editDisplayName}
            onChangeText={setEditDisplayName}
          />
          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value={editBio}
            onChangeText={setEditBio}
            multiline
          />
          <Button
            variant="primary"
            onPress={handleUpdateProfile}
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </View>
      </Modal>

      <Modal
        isOpen={showAppearanceModal}
        onClose={() => setShowAppearanceModal(false)}
        title="Appearance"
      >
        <View>
          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">🌙</Text>
              <View>
                <Text className="text-gray-900 font-medium">Dark Mode</Text>
                <Text className="text-gray-500 text-sm">Use dark theme throughout the app</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={(value) => {
                setDarkModeEnabled(value);
                Alert.alert(
                  value ? 'Dark Mode Enabled' : 'Dark Mode Disabled',
                  'Full dark mode support coming soon!'
                );
              }}
              trackColor={{ false: '#E5E7EB', true: '#00C9B7' }}
              thumbColor={darkModeEnabled ? '#fff' : '#fff'}
            />
          </View>

          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">☀️</Text>
              <View>
                <Text className="text-gray-900 font-medium">Light Mode</Text>
                <Text className="text-gray-500 text-sm">Default appearance</Text>
              </View>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 ${!darkModeEnabled ? 'bg-secondary-500 border-secondary-500' : 'border-gray-300'}`}>
              {!darkModeEnabled && <Text className="text-white text-center text-xs">✓</Text>}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Help & Support"
      >
        <View>
          <Text className="text-gray-600 mb-4">
            Need help with Recipe Wildcard? We're here for you!
          </Text>

          <TouchableOpacity
            onPress={handleEmailSupport}
            className="bg-gray-50 rounded-xl px-4 py-4 mb-3 flex-row items-center"
          >
            <Text className="text-xl mr-3">📧</Text>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">Email Support</Text>
              <Text className="text-secondary-600">info@aigencytech.com</Text>
            </View>
          </TouchableOpacity>

          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
            <Text className="text-gray-900 font-bold text-base mb-3">FAQs</Text>

            <View className="mb-4">
              <Text className="text-gray-900 font-semibold mb-1">How do I create a recipe?</Text>
              <Text className="text-gray-600 text-sm">
                You can create a recipe using several methods:{'\n\n'}
                1. You can upload an existing recipe that is in a text file format and then have the app add a wildcard ingredient to your recipe to spruce it up.{'\n\n'}
                2. You can import a recipe by copying and pasting a URL link to the recipe. Note: Some websites block access to the app being able to download the recipe. If this happens you can copy and paste the text of the recipe from your phone screen and then add a wildcard ingredient while submitting to the app.{'\n\n'}
                3. You can use AI Generate to tell the app what kind of recipe that you would like to create and have the AI generate the recipe for you complete with wildcard ingredients by selecting the checkbox prior to generating the recipe.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-900 font-semibold mb-1">What is a wildcard ingredient?</Text>
              <Text className="text-gray-600 text-sm">
                Wildcard ingredients are unexpected ingredients that are not typically found in off the shelf recipes that add extra depth of flavor, unique tastes, and elevate the dish. These are ingredients that you are likely to see professional chefs add to their dishes such as mushroom powder, fish sauce, gochujang, etc.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-900 font-semibold mb-1">How do I save recipes?</Text>
              <Text className="text-gray-600 text-sm">
                If you have created an account in the app you can save your recipes and recipes from the Discover section to your profile. When creating or generating a recipe once the recipe is complete there will be a "Save Recipe" button. For existing recipes in the Discovery section select the Heart icon in the upper right to save the recipe to your profile for future easy access.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-900 font-semibold mb-1">How do I unsave a recipe?</Text>
              <Text className="text-gray-600 text-sm">
                To remove a recipe from your saved items click on the "Saved" icon at the top, select the recipe that you would like to remove and click on the red heart at the top right so that it becomes a gray color.
              </Text>
            </View>
          </ScrollView>

          <Button
            variant="primary"
            onPress={handleEmailSupport}
            className="mt-3"
          >
            Contact Support
          </Button>
        </View>
      </Modal>

      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
          <Text className="text-gray-500 text-sm mb-4">Last updated: January 30, 2026</Text>

          <Text className="text-gray-700 mb-3">
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
          </Text>

          <Text className="text-gray-700 mb-4">
            We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
          </Text>

          <Text className="text-lg font-bold text-gray-900 mb-2">Interpretation and Definitions</Text>

          <Text className="text-base font-semibold text-gray-900 mb-2">Interpretation</Text>
          <Text className="text-gray-700 mb-3">
            The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </Text>

          <Text className="text-base font-semibold text-gray-900 mb-2">Definitions</Text>
          <Text className="text-gray-700 mb-1">For the purposes of this Privacy Policy:</Text>

          <View className="pl-3 mb-3">
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Account</Text> means a unique account created for You to access our Service or parts of our Service.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Application</Text> refers to Recipe Wildcard, the software program provided by the Company.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Company</Text> (referred to as either "the Company", "We", "Us" or "Our" in this Privacy Policy) refers to Aigency Technologies LLC, 133 W Michigan Ave, Jackson, MI 49201.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Country</Text> refers to: Michigan, United States</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Device</Text> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Personal Data</Text> is any information that relates to an identified or identifiable individual.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Service</Text> refers to the Application.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Service Provider</Text> means any natural or legal person who processes the data on behalf of the Company.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">Usage Data</Text> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself.</Text>
            <Text className="text-gray-700 mb-2">• <Text className="font-semibold">You</Text> means the individual accessing or using the Service.</Text>
          </View>

          <Text className="text-lg font-bold text-gray-900 mb-2">Collecting and Using Your Personal Data</Text>

          <Text className="text-base font-semibold text-gray-900 mb-2">Types of Data Collected</Text>

          <Text className="font-semibold text-gray-800 mb-1">Personal Data</Text>
          <Text className="text-gray-700 mb-2">
            While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
          </Text>
          <Text className="text-gray-700 mb-3 pl-3">• Email address</Text>

          <Text className="font-semibold text-gray-800 mb-1">Usage Data</Text>
          <Text className="text-gray-700 mb-3">
            Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device's Internet Protocol address, browser type, the pages of our Service that You visit, the time and date of Your visit, unique device identifiers and other diagnostic data.
          </Text>

          <Text className="text-base font-semibold text-gray-900 mb-2">Use of Your Personal Data</Text>
          <Text className="text-gray-700 mb-1">The Company may use Personal Data for the following purposes:</Text>
          <View className="pl-3 mb-3">
            <Text className="text-gray-700 mb-1">• To provide and maintain our Service</Text>
            <Text className="text-gray-700 mb-1">• To manage Your Account</Text>
            <Text className="text-gray-700 mb-1">• For the performance of a contract</Text>
            <Text className="text-gray-700 mb-1">• To contact You</Text>
            <Text className="text-gray-700 mb-1">• To provide You with news and special offers</Text>
            <Text className="text-gray-700 mb-1">• To manage Your requests</Text>
            <Text className="text-gray-700 mb-1">• For business transfers</Text>
            <Text className="text-gray-700 mb-1">• For data analysis and service improvement</Text>
          </View>

          <Text className="text-base font-semibold text-gray-900 mb-2">Retention of Your Personal Data</Text>
          <Text className="text-gray-700 mb-3">
            The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.
          </Text>

          <Text className="text-base font-semibold text-gray-900 mb-2">Delete Your Personal Data</Text>
          <Text className="text-gray-700 mb-3">
            You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You. You may update, amend, or delete Your information at any time by signing in to Your Account and visiting the account settings section.
          </Text>

          <Text className="text-base font-semibold text-gray-900 mb-2">Security of Your Personal Data</Text>
          <Text className="text-gray-700 mb-3">
            The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.
          </Text>

          <Text className="text-lg font-bold text-gray-900 mb-2">Children's Privacy</Text>
          <Text className="text-gray-700 mb-3">
            Our Service does not address anyone under the age of 16. We do not knowingly collect personally identifiable information from anyone under the age of 16.
          </Text>

          <Text className="text-lg font-bold text-gray-900 mb-2">Changes to this Privacy Policy</Text>
          <Text className="text-gray-700 mb-3">
            We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </Text>

          <Text className="text-lg font-bold text-gray-900 mb-2">Contact Us</Text>
          <Text className="text-gray-700 mb-1">If you have any questions about this Privacy Policy, You can contact us:</Text>
          <Text className="text-secondary-600 mb-4">• By email: info@aigencytech.com</Text>
        </ScrollView>
      </Modal>
      </SafeArea>
    </LinearGradient>
  );
}
