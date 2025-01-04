import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { fonts } from '@/constants/fonts';
import { reflectionService } from '@/services/reflection.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


interface ReflectionDetail {
    id: string;
    content: string;
    created_at: string;
    reflection_insights: Array<{
        insight: string;
        scripture_verse: string;
        scripture_reference: string;
        explanation: string;
        theme?: string;
    }>;
}

export default function ReflectionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [reflection, setReflection] = useState<ReflectionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReflection();
    }, [id]);

    const loadReflection = async () => {
        try {
            const entry = await reflectionService.getEntryWithInsights(id);
            setReflection(entry);
        } catch (error) {
            console.error('Failed to load reflection:', error);
            // TODO: Show error toast
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!reflection) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Reflection not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable 
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                    
                </Pressable>
                <Text style={styles.date}>{formatDate(reflection.created_at)}</Text>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.reflectionText}>{reflection.content}</Text>

                    <View style={styles.insightsContainer}>
                        <Text style={styles.insightsTitle}>Insights</Text>
                        {reflection.reflection_insights.map((insight, index) => (
                            <View key={index} style={styles.insightCard}>
                                <Text style={styles.insight}>{insight.insight}</Text>
                                <View style={styles.scriptureContainer}>
                                    <Text style={styles.scripture}>
                                        "{insight.scripture_verse}"
                                    </Text>
                                    <Text style={styles.reference}>
                                        - {insight.scripture_reference}
                                    </Text>
                                </View>
                                <Text style={styles.explanation}>{insight.explanation}</Text>
                                {insight.theme && (
                                    <View style={[
                                        styles.themeTag,
                                        { backgroundColor: getThemeColor(insight.theme) }
                                    ]}>
                                        <Text style={styles.themeText}>{insight.theme}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFDF7',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    date: {
        fontFamily: fonts.manropeMedium,
        fontSize: 16,
        marginLeft: 8,
        flex: 1,
        color: '#666',
        marginBottom: 0,
    },
    reflectionText: {
        fontFamily: fonts.manropeRegular,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    insightsContainer: {
        paddingVertical: 20,
    },
    insightsTitle: {
        fontFamily: fonts.manropeSemibold,
        fontSize: 24,
        marginBottom: 16,
    },
    insightCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    insight: {
        fontFamily: fonts.manropeSemibold,
        fontSize: 18,
        marginBottom: 12,
    },
    scriptureContainer: {
        marginBottom: 12,
    },
    scripture: {
        fontFamily: fonts.manropeRegular,
        fontSize: 16,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    reference: {
        fontFamily: fonts.manropeMedium,
        fontSize: 14,
        color: '#666',
    },
    explanation: {
        fontFamily: fonts.manropeRegular,
        fontSize: 16,
        lineHeight: 24,
    },
    themeTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginTop: 12,
    },
    themeText: {
        fontFamily: fonts.manropeMedium,
        fontSize: 14,
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontFamily: fonts.manropeMedium,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

const getThemeColor = (theme: string): string => {
    const colors: { [key: string]: string } = {
        'Calm': '#7BB4E3',
        'Happy': '#90D4B0',
        'Determined': '#B784E0',
        // Add more theme colors as needed
    };
    return colors[theme] || '#666';
}; 